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
  const [hands, setHands] = useState([[], []]); // [mano J1, mano J2]

  // Mesa: TODAS las cartas jugadas, en orden
  // index 0–1 → ronda 1 / 2–3 → ronda 2 / 4–5 → ronda 3
  const [table, setTable] = useState([]);

  // Estado de la partida (3 rondas)
  const [truco, setTruco] = useState({
    mano: "P1",                 // por ahora siempre J1 es mano
    turno: "P1",                // quién debe tirar AHORA ("P1" o "P2")
    winners: [null, null, null],// ganadores de cada ronda ("P1","P2","Parda")
    finished: false,            // true cuando la partida ya se definió
    ganadorPartida: null        // "P1" | "P2" cuando alguien gana la partida
  });

  // Puntos del JUEGO (hasta 30)
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

    // Reiniciamos estado de la partida
    setTruco({
      mano: "P1",              // más adelante podemos alternar
      turno: "P1",
      winners: [null, null, null],
      finished: false,
      ganadorPartida: null
    });
  };

  // ================== JUGAR CARTA — J1 ==================
  const playCard = (playerIndex, cardIndex) => {
    // Si la partida ya se definió → no deja tirar
    if (truco.finished) return;

    // Solo permitimos que juegue J1 cuando es su turno
    if (playerIndex === 0 && truco.turno !== "P1") return;

    const carta = hands[playerIndex][cardIndex];
    if (!carta) return;

    const newHands = hands.map((h, idx) =>
      idx === playerIndex ? h.filter((_, i) => i !== cardIndex) : h
    );
    setHands(newHands);

    // Agregamos carta a la mesa (sin preocuparnos por la ronda, va en orden)
    setTable(prev => [...prev, { from: playerIndex, card: carta }]);

    // Después de tirar J1, en principio le tocaría a J2
    setTruco(prev => ({ ...prev, turno: "P2" }));
  };

  // ================== JUGAR CARTA — J2 (BOT) ==================
  const opponentPlay = () => {
    if (truco.finished) return;
    if (truco.turno !== "P2") return;

    setHands(prevHands => {
      const rivalHand = prevHands[1];
      if (!rivalHand || rivalHand.length === 0) return prevHands;

      const rivalCard = rivalHand[0];

      const updatedHands = [
        [...prevHands[0]],
        rivalHand.slice(1)
      ];

      setTable(prev => [...prev, { from: 1, card: rivalCard }]);

      // Por ahora, después de tirar J2, dejamos turno en P1
      // (la lógica de rondas lo ajustará si tiene que volver a tirar J2)
      setTruco(prev => ({ ...prev, turno: "P1" }));

      return updatedHands;
    });
  };

  // Cuando el turno pasa a P2 → el bot juega
  useEffect(() => {
    if (truco.finished) return;
    if (truco.turno === "P2") {
      setTimeout(() => opponentPlay(), 600);
    }
  }, [truco.turno, truco.finished]);

  // ================== LÓGICA DE LAS 3 RONDAS ==================
  useEffect(() => {
    if (truco.finished) return;
    if (table.length === 0) return;

    // Solo resolvemos cuando hay un par completo de cartas (2, 4 o 6)
    if (table.length % 2 !== 0) return;

    const roundIndex = table.length / 2 - 1; // 0, 1 o 2
    if (roundIndex < 0 || roundIndex > 2) return;

    // Si esa ronda ya tiene ganador, no la volvemos a resolver
    if (truco.winners[roundIndex]) return;

    const start = roundIndex * 2;
    const c1 = table[start];
    const c2 = table[start + 1];

    const ganador = determineHandWinner(c1.card, c2.card); // "P1" | "P2" | "Parda"

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
          // parda → tira el mano
          state.turno = mano;
        } else {
          // gana alguien → ese tira la segunda
          state.turno = ganador;
        }
        return state;
      }

      // ========= RONDA 2 =========
      if (roundIndex === 1) {
        // ganador = ganador de la segunda ronda
        if (ganador === "Parda") {
          // Segunda parda
          if (first === "P1" || first === "P2") {
            // Si alguien ganó la primera, gana la partida
            state.finished = true;
            state.ganadorPartida = first;
            state.turno = null;
          } else {
            // Parda en 1ª y 2ª → se juega 3ª, tira el mano
            state.turno = mano;
          }
          return state;
        }

        // Segunda NO es parda (gana P1 o P2)
        if (first === "Parda") {
          // Si la 1ª fue parda, el que gana la 2ª gana la partida
          state.finished = true;
          state.ganadorPartida = ganador;
          state.turno = null;
          return state;
        }

        if (first === ganador) {
          // Mismo ganador en 1ª y 2ª → gana la partida
          state.finished = true;
          state.ganadorPartida = ganador;
          state.turno = null;
          return state;
        }

        // Distintos ganadores → 1 a 1 → se juega la 3ª
        // Tira el que ganó la segunda
        state.turno = ganador;
        return state;
      }

      // ========= RONDA 3 =========
      if (roundIndex === 2) {
        let ganadorPartida;

        if (ganador === "Parda") {
          // Si la 3ª es parda, vemos quién tiene más rondas ganadas
          const p1Wins = [first, second].filter(w => w === "P1").length;
          const p2Wins = [first, second].filter(w => w === "P2").length;

          if (p1Wins > p2Wins) ganadorPartida = "P1";
          else if (p2Wins > p1Wins) ganadorPartida = "P2";
          else ganadorPartida = mano; // triple parda o totalmente empatado
        } else {
          // Si alguien gana la 3ª → ese gana la partida
          ganadorPartida = ganador;
        }

        state.finished = true;
        state.ganadorPartida = ganadorPartida;
        state.turno = null;
        return state;
      }

      return state;
    });
  }, [table, truco.finished, truco.winners, truco.mano]);

  // ================== SUMAR PUNTOS DE LA PARTIDA ==================
  useEffect(() => {
    const ganador = truco.ganadorPartida;
    if (!ganador) return;

    if (ganador === "P1") setPointsP1(p => p + 1);
    if (ganador === "P2") setPointsP2(p => p + 1);
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
