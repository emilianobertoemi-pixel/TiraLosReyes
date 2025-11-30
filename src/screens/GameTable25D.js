import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import AnotadorTruco from "../components/AnotadorTruco";
import "./table25d.css";

import { generateDeck, shuffle } from "../data/deck";
import { determineHandWinner } from "../gameLogic/truco/determineHandWinner";

export default function GameTable25D() {
  const navigate = useNavigate();

  // ================= ESTADO GENERAL =================
  const [deck, setDeck] = useState(() => shuffle(generateDeck()));
  const [hands, setHands] = useState([[], []]);

  // Mesa: TODAS las cartas jugadas
  const [table, setTable] = useState([]);

  // Estado de la partida
  const [truco, setTruco] = useState({
    mano: "P1",
    turno: "P1",
    winners: [null, null, null],
    finished: false,
    ganadorPartida: null
  });

  const [pointsP1, setPointsP1] = useState(0);
  const [pointsP2, setPointsP2] = useState(0);

  // ====================== REPARTIR ======================
  const deal = () => {
    const d = [...shuffle(generateDeck())];
    const newHands = [[], []];

    for (let i = 0; i < 3; i++) {
      newHands[0].push(d.pop());
      newHands[1].push(d.pop());
    }

    setHands(newHands);
    setDeck(d);
    setTable([]);

    setTruco({
      mano: "P1",
      turno: "P1",
      winners: [null, null, null],
      finished: false,
      ganadorPartida: null
    });
  };

  // ================== JUGAR CARTA — J1 ==================
  const playCard = (playerIndex, cardIndex) => {
    if (truco.finished) return;
    if (playerIndex === 0 && truco.turno !== "P1") return;

    const carta = hands[playerIndex][cardIndex];
    if (!carta) return;

    const newHands = hands.map((h, idx) =>
      idx === playerIndex ? h.filter((_, i) => i !== cardIndex) : h
    );

    setHands(newHands);

    setTable(prev => [...prev, { from: playerIndex, card: carta }]);

    setTruco(prev => ({ ...prev, turno: "P2" }));
  };

  // ================== JUGAR CARTA — J2 ==================
  const opponentPlay = () => {
    if (truco.finished) return;
    if (truco.turno !== "P2") return;

    setHands(prevHands => {
      const rival = prevHands[1];
      if (rival.length === 0) return prevHands;

      const card = rival[0];
      const updated = [prevHands[0], rival.slice(1)];

      setTable(prev => [...prev, { from: 1, card }]);

      setTruco(prev => ({ ...prev, turno: "P1" }));

      return updated;
    });
  };

  // ================== LOGICA DEL BOT ==================
  useEffect(() => {
    if (truco.finished) return;

    const total = table.length;
    const ronda = Math.floor(total / 2);
    const cardsInRound = total % 2;

    if (truco.turno !== "P2") return;

    // RONDA 1
    if (ronda === 0) {
      if (cardsInRound === 1) {
        setTimeout(() => opponentPlay(), 400);
      }
      return;
    }

    // RONDA 2
    if (ronda === 1) {
      const w1 = truco.winners[0];

      // si J2 ganó ronda 1 y arranca ronda 2
      if (w1 === "P2" && cardsInRound === 0) {
        setTimeout(() => opponentPlay(), 400);
        return;
      }

      if (cardsInRound === 1) {
        setTimeout(() => opponentPlay(), 400);
        return;
      }

      return;
    }

    // RONDA 3
    if (ronda === 2) {
      const w1 = truco.winners[0];
      const w2 = truco.winners[1];

      const start =
        w2 === "Parda"
          ? w1
          : w2;

      if (start === "P2" && cardsInRound === 0) {
        setTimeout(() => opponentPlay(), 400);
        return;
      }

      if (cardsInRound === 1) {
        setTimeout(() => opponentPlay(), 400);
        return;
      }
    }

  }, [truco.turno, table, truco.finished, truco.winners]);

  // ================== LÓGICA DE RONDAS ==================
  useEffect(() => {
    if (truco.finished) return;
    if (table.length === 0) return;
    if (table.length % 2 !== 0) return;

    const roundIndex = table.length / 2 - 1;
    if (roundIndex < 0 || roundIndex > 2) return;

    if (truco.winners[roundIndex]) return;

        const start = roundIndex * 2;
    const c1 = table[start];
    const c2 = table[start + 1];

    // Este resultado es relativo al orden de las cartas (primera o segunda)
    const resultado = determineHandWinner(c1.card, c2.card); // "P1" | "P2" | "Parda"

    // Ahora lo convertimos a ganador REAL del juego: "P1" (jugador 1), "P2" (jugador 2) o "Parda"
    let ganador;
    if (resultado === "Parda") {
      ganador = "Parda";
    } else if (resultado === "P1") {
      // Ganó la PRIMERA carta → vemos de quién es
      ganador = c1.from === 0 ? "P1" : "P2";
    } else {
      // resultado === "P2" → ganó la SEGUNDA carta
      ganador = c2.from === 0 ? "P1" : "P2";
    }

    console.log(
      `Ronda ${roundIndex + 1} → resultado bruto: ${resultado}, from c1=${c1.from}, from c2=${c2.from}, GANADOR REAL: ${ganador}`
    );

    setTruco(prev => {
      const state = {
        ...prev,
        winners: [...prev.winners]
      };

      state.winners[roundIndex] = ganador;
      const mano = state.mano;
      const first = state.winners[0];
      const second = state.winners[1];


      // ========= RONDA 1 =========
      if (roundIndex === 0) {
        if (ganador === "Parda") {
          state.turno = mano;
        } else {
          state.turno = ganador;
        }
        return state;
      }

      // ========= RONDA 2 — FIX COMPLETO =========
      if (roundIndex === 1) {
        // A) Segunda es Parda → define el de la primera
        if (ganador === "Parda") {
          if (first === "P1" || first === "P2") {
            state.finished = true;
            state.ganadorPartida = first;
            state.turno = null;
            return state;
          }

          // parda1 + parda2 → mano inicia ronda 3
          state.turno = mano;
          return state;
        }

        // B) Primera fue parda, segunda tiene ganador
        if (first === "Parda") {
          state.finished = true;
          state.ganadorPartida = ganador;
          state.turno = null;
          return state;
        }

        // C) Si mismo ganador en 1° y 2°
        if (first === ganador) {
          state.finished = true;
          state.ganadorPartida = ganador;
          state.turno = null;
          return state;
        }

        // D) Van 1 a 1 → hay ronda 3 → arranca ganador de la segunda
        state.turno = ganador;
        return state;
      }

      // ========= RONDA 3 =========
      if (roundIndex === 2) {
        let final;

        if (ganador === "Parda") {
          const p1 = [first, second].filter(w => w === "P1").length;
          const p2 = [first, second].filter(w => w === "P2").length;

          if (p1 > p2) final = "P1";
          else if (p2 > p1) final = "P2";
          else final = mano;
        } else {
          final = ganador;
        }

        state.finished = true;
        state.ganadorPartida = final;
        state.turno = null;
        return state;
      }

      return state;
    });

  }, [table, truco.finished, truco.winners, truco.mano]);

  // ================== SUMAR PUNTOS ==================
  useEffect(() => {
    const g = truco.ganadorPartida;
    if (!g) return;

    if (g === "P1") setPointsP1(p => p + 1);
    if (g === "P2") setPointsP2(p => p + 1);
  }, [truco.ganadorPartida]);

  // ======================== RENDER ========================
  return (
    <div
      className="mesa25d-container"
      style={{
        backgroundImage: "url('/assets/backgrounds/tapete-mesa.jpg')",
      }}
    >
      <AnotadorTruco puntosP1={pointsP1} puntosP2={pointsP2} />

      {/* CARTAS EN LA MESA */}
      <div className="mesa25d-center">
        {table.map((t, i) => (
          <Card
            key={i}
            img={t.card.img}
            faceUp={true}
            style={{
              position: "absolute",
              top: "-20px",
              left: `${i * 40}px`,
              transform: "translate(-50%, -50%)",
              zIndex: 50 + i,
            }}
          />
        ))}
      </div>

      {/* MANO DEL RIVAL */}
      <div className="opponent-hand">
        {hands[1].map((card, i) => (
          <Card
            key={card.id}
            img={card.img}
            faceUp={false}
            style={{
              position: "relative",
              left: `${i * 40}px`,
              transform: "rotate(180deg)",
            }}
          />
        ))}
      </div>

      {/* TU MANO */}
      <div
        className="player-hand-25d"
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "15px",
        }}
      >
        {hands[0].map((card, i) => (
          <Card
            key={card.id}
            img={card.img}
            faceUp={true}
            onClick={() => playCard(0, i)}
            style={{
              position: "relative",
              transform: `rotate(${(i - 1) * 12}deg)`,
              zIndex: 50 + i,
            }}
          />
        ))}
      </div>

      {/* MENÚ LATERAL */}
      <div className="side-menu-25d">
        <button className="action-btn">Truco</button>
        <button className="action-btn">Re Truco</button>
        <button className="action-btn">Vale Cuatro</button>
        <button className="action-btn">Envido</button>
        <button className="action-btn">Real Envido</button>
        <button className="action-btn">Falta Envido</button>
        <button className="action-btn">Flor</button>
        <button className="action-btn">Quiero</button>
        <button className="action-btn">No quiero</button>

        <div
          style={{
            width: "100%",
            height: "2px",
            background: "rgba(255,255,255,0.25)",
            margin: "15px 0",
          }}
        />

        <button className="system-btn" onClick={deal}>
          Repartir
        </button>
        <button className="system-btn" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
}
