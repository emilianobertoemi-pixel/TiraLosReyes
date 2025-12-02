import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import AnotadorTruco from "../components/AnotadorTruco";
import "./table25d.css";

import { generateDeck, shuffle } from "../data/deck";
import { determineHandWinner } from "../gameLogic/truco/determineHandWinner";
import { evaluateHand } from "../gameLogic/truco/evaluateHand";

// Evalúa la fuerza de la mano del BOT
function evaluateBotHand(hand) {
  if (!hand || hand.length === 0) {
    return { level: "mala" };
  }

  const ranks = hand.map(c => c.rank);
  const hasAnchoEspada = hand.some(c => c.suit === "espada" && c.rank === 1);
  const hasAnchoBasto  = hand.some(c => c.suit === "basto" && c.rank === 1);
  const hasSieteEspada = hand.some(c => c.suit === "espada" && c.rank === 7);
  const hasSieteOro    = hand.some(c => c.suit === "oro" && c.rank === 7);

  if (hasAnchoEspada || (hasAnchoBasto && (hasSieteEspada || hasSieteOro))) {
    return { level: "muy_fuerte" };
  }

  if (hasAnchoBasto || hasSieteEspada || hasSieteOro) {
    return { level: "fuerte" };
  }

  const fuertes = ranks.filter(r => r === 3 || r === 2 || r === 12 || r === 11 || r === 10);
  if (fuertes.length >= 2) {
    return { level: "media" };
  }

  return { level: "mala" };
}



export default function GameTable25D() {
  const navigate = useNavigate();

  // ================= ESTADO GENERAL =================
  const [deck, setDeck] = useState(() => shuffle(generateDeck()));
  const [hands, setHands] = useState([[], []]); // [J1, J2]
  const [table, setTable] = useState([]);       // cartas jugadas en orden

  const [truco, setTruco] = useState({
    mano: "P1",
    turno: "P1",
    winners: [null, null, null], // ganadores de cada ronda
    finished: false,
    ganadorPartida: null,

    // CANTOS
    canto: null,          // "truco" | "retruco" | "valecuatro" | null
    cantoNivel: 0,        // 0=sin canto, 1=truco, 2=retruco, 3=vale cuatro
    quienCanto: null,     // "P1" o "P2"
    esperandoRespuesta: false,
    turnoAntesDelCanto: null
  });

  const [pointsP1, setPointsP1] = useState(0);
  const [pointsP2, setPointsP2] = useState(0);

  // Mensajes de cantos en pantalla
  const [cantosLog, setCantosLog] = useState([]);

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
      ganadorPartida: null,
      canto: null,
      cantoNivel: 0,
      quienCanto: null,
      esperandoRespuesta: false,
    });

    setCantosLog([]);
  };

  // ================== JUGAR CARTA — J1 ==================
  const playCard = (playerIndex, cardIndex) => {
    if (truco.finished) return;
    if (truco.esperandoRespuesta) return;
    if (playerIndex === 0 && truco.turno !== "P1") return;

    const carta = hands[playerIndex][cardIndex];
    if (!carta) return;

    const newHands = hands.map((h, idx) =>
      idx === playerIndex ? h.filter((_, i) => i !== cardIndex) : h
    );

    setHands(newHands);

    setTable((prev) => [...prev, { from: playerIndex, card: carta }]);

    setTruco((prev) => ({ ...prev, turno: "P2" }));
  };

  // ================== JUGAR CARTA — J2 ==================
  const opponentPlay = () => {
    if (truco.finished) return;
    if (truco.esperandoRespuesta) return;
    if (truco.turno !== "P2") return;

    setHands((prevHands) => {
      const rival = prevHands[1];
      if (!rival || rival.length === 0) return prevHands;

      const card = rival[0];
      const updated = [prevHands[0], rival.slice(1)];

      setTable((prev) => [...prev, { from: 1, card }]);

      setTruco((prev) => ({ ...prev, turno: "P1" }));

      return updated;
    });
  };

  // ================== BOT RESPONDE CANTO (IA) ==================
  const responderCantoBot = () => {
    if (!truco.esperandoRespuesta || truco.finished) return;

    const manoBot = hands[1] || [];
    const handEval = evaluateHand(manoBot);
    const nivel = truco.cantoNivel || 1;

    let probAceptar = 0.5;
    let probSubir = 0;

    // Ajustamos probabilidades según fuerza de mano y nivel del canto
    if (nivel === 1) {
      // Truco
      if (handEval.level === "muy_fuerte") {
        probAceptar = 0.95;
        probSubir = 0.45;
      } else if (handEval.level === "fuerte") {
        probAceptar = 0.85;
        probSubir = 0.25;
      } else if (handEval.level === "media") {
        probAceptar = 0.6;
        probSubir = 0.05;
      } else {
        probAceptar = 0.35;
        probSubir = 0;
      }
    } else if (nivel === 2) {
      // Re Truco
      if (handEval.level === "muy_fuerte") {
        probAceptar = 0.9;
        probSubir = 0.3;
      } else if (handEval.level === "fuerte") {
        probAceptar = 0.75;
        probSubir = 0.1;
      } else if (handEval.level === "media") {
        probAceptar = 0.5;
        probSubir = 0;
      } else {
        probAceptar = 0.25;
        probSubir = 0;
      }
    } else {
      // Vale Cuatro – no puede subir más
      if (handEval.level === "muy_fuerte") probAceptar = 0.8;
      else if (handEval.level === "fuerte") probAceptar = 0.6;
      else if (handEval.level === "media") probAceptar = 0.4;
      else probAceptar = 0.2;
      probSubir = 0;
    }

    const r = Math.random();
    const puedeSubir = nivel < 3;

    // ¿Sube la apuesta?
    if (puedeSubir && r < probSubir) {
      const nextNivel = nivel + 1;
      const nextCanto = nextNivel === 2 ? "retruco" : "valecuatro";
      const texto =
        nextCanto === "retruco"
          ? "Bot: Quiero Re Truco"
          : "Bot: Quiero Vale Cuatro";

      setCantosLog((prev) => [...prev, texto]);

      setTruco((prev) => ({
        ...prev,
        canto: nextCanto,
        cantoNivel: nextNivel,
        esperandoRespuesta: true,
        turnoAntesDelCanto: prev.turno, // 🟦 guardamos quien debía jugar
        quienCanto: "P2",
        turno: "P1",
      }));

      return;
    }

    // ¿Acepta sin subir?
    if (r < probAceptar) {
      const texto =
        nivel === 1
          ? "Bot: Quiero al Truco"
          : nivel === 2
          ? "Bot: Quiero al Re Truco"
          : "Bot: Quiero al Vale Cuatro";

      setCantosLog((prev) => [...prev, texto]);

      setTruco((prev) => ({
        ...prev,
        esperandoRespuesta: false,
        turno: "P1",
      }));

      return;
    }

    // NO QUIERE
    const textoNo =
      nivel === 1
        ? "Bot: No quiero al Truco"
        : nivel === 2
        ? "Bot: No quiero al Re Truco"
        : "Bot: No quiero al Vale Cuatro";

    setCantosLog((prev) => [...prev, textoNo]);

    const puntos = nivel === 1 ? 1 : nivel === 2 ? 2 : 3;
    setPointsP1((p) => p + puntos);

    setTruco((prev) => ({
      ...prev,
      esperandoRespuesta: false,
      finished: true,
      ganadorPartida: "P1",
      turno: null,
    }));
  };

  // BOT responde a los cantos (con delay)
  useEffect(() => {
    if (!truco.esperandoRespuesta) return;
    if (truco.turno !== "P2") return;
    if (truco.finished) return;

    const timer = setTimeout(() => responderCantoBot(), 800);
    return () => clearTimeout(timer);
  }, [truco.esperandoRespuesta, truco.turno, truco.finished, hands]);

  // ================== LÓGICA DEL BOT (cartas) ==================
useEffect(() => {
  if (truco.finished) return;
  if (truco.esperandoRespuesta) return;

  //-------------------------------------------------------------
  // 🧠 IA RONDA 1 — BOT AGRESIVO CANTA TRUCO SI SU MANO ES FUERTE
  //-------------------------------------------------------------
  const ronda = Math.floor(table.length / 2);
  const cardsInRound = table.length % 2;

  if (
    ronda === 0 &&
    cardsInRound === 0 &&     // bot aún no tiró su primera carta
    !truco.canto &&           // no hay truco en juego todavía
    truco.quienCanto !== "P2" &&        // 🔥 el bot NO puede volver a cantar después de cantar él mismo
    hands[1].length === 3
  ) {
    const evalBot = evaluateHand(hands[1]);

    const prob =
      evalBot.level === "muy_fuerte" ? 0.90 :
      evalBot.level === "fuerte"     ? 0.70 :
      evalBot.level === "media"      ? 0.25 :
      0.05;

    if (Math.random() < prob) {
      setCantosLog(prev => [...prev, "Bot: Truco"]);
      setTruco(prev => ({
        ...prev,
        canto: "truco",
        cantoNivel: 1,
        quienCanto: "P2",
        esperandoRespuesta: true,
        turnoAntesDelCanto: prev.turno,
        turno: "P1",
      }));
      return;
    }
  }

  //-------------------------------------------------------------
  // 🧠 IA RONDA 2 — BOT SUBE A RETRUCO SI TIENE VENTAJA
  //-------------------------------------------------------------
  if (
    ronda === 1 &&
    !truco.esperandoRespuesta &&
    truco.canto === "truco" &&
    truco.quienCanto !== "P2" &&   // 🔥 si el BOT cantó truco, no puede cantar Re Truco
    hands[1].length === 2
  ) {
    const evalBot = evaluateHand(hands[1]);
    const botGanoR1 = truco.winners[0] === "P2";

    const prob =
      botGanoR1                      ? 0.85 :
      evalBot.level === "muy_fuerte" ? 0.75 :
      evalBot.level === "fuerte"     ? 0.55 :
      evalBot.level === "media"      ? 0.25 :
      0.05;

    if (Math.random() < prob) {
      setCantosLog(prev => [...prev, "Bot: Quiero Re Truco"]);
      setTruco(prev => ({
        ...prev,
        canto: "retruco",
        cantoNivel: 2,
        quienCanto: "P2",
        esperandoRespuesta: true,
        turnoAntesDelCanto: prev.turno,
        turno: "P1",
      }));
      return;
    }
  }

  //-------------------------------------------------------------
  // 🧠 IA RONDA 3 — BOT SUBE A VALE CUATRO SI LA ÚLTIMA LE GANA
  //-------------------------------------------------------------
  if (
    truco.canto &&
    truco.quienCanto !== "P2" &&    // 🔥 bot NO puede subir si el truco lo cantó él
    !truco.esperandoRespuesta &&
    hands[1].length === 1 &&
    hands[0].length === 1
  ) {
    const cartaBot = hands[1][0];
    const cartaTuya = hands[0][0];

    const result = determineHandWinner(cartaBot, cartaTuya);
    const botGanaUltima = result === "P2";

    if (botGanaUltima && Math.random() < 0.70) {
      if (truco.canto === "truco") {
        setCantosLog(prev => [...prev, "Bot: Quiero Re Truco"]);
        setTruco(prev => ({
          ...prev,
          canto: "retruco",
          cantoNivel: 2,
          quienCanto: "P2",
          esperandoRespuesta: true,
          turnoAntesDelCanto: prev.turno,
          turno: "P1",
        }));
        return;
      }

      if (truco.canto === "retruco") {
        setCantosLog(prev => [...prev, "Bot: Quiero Vale Cuatro"]);
        setTruco(prev => ({
          ...prev,
          canto: "valecuatro",
          cantoNivel: 3,
          quienCanto: "P2",
          esperandoRespuesta: true,
          turnoAntesDelCanto: prev.turno,
          turno: "P1",
        }));
        return;
      }
    }
  }

  // ------------------------------------------------------------
  //  DESDE ACÁ SIGUE TU LÓGICA ORIGINAL
  // ------------------------------------------------------------
  if (truco.turno !== "P2") return;

  const total = table.length;
  const ronda2 = Math.floor(total / 2);
  const cardsInRound2 = total % 2;

  // ... EL RESTO DE TU CÓDIGO SIGUE IGUAL ...


  //-------------------------------------------------------------
//  🧠 IA EXTRA: BOT DECIDE SUBIR A RETRUCO / VALE 4 EN LA ÚLTIMA
//-------------------------------------------------------------
if (
  !truco.finished &&
  !truco.esperandoRespuesta &&
  truco.canto &&                       // ya hay truco/retruco/vale 4 en juego
  hands[1].length === 1 &&             // bot tiene UNA carta
  hands[0].length === 1 &&             // vos también UNA carta
  truco.turno === "P2"                 // es el turno del bot
) {
  const cartaBot = hands[1][0];
  const cartaTuya = hands[0][0];

  const result = determineHandWinner(cartaBot, cartaTuya);

  // ¿El bot gana seguro esta última?
  const botGanaUltima = result === "P2";

  if (botGanaUltima) {
    // Probabilidad del 70% (Opción B)
    const r = Math.random();
    if (r < 0.7) {

      // Decide qué canto corresponde según el nivel actual
      if (truco.canto === "truco") {
        setCantosLog(prev => [...prev, "Bot: Quiero Re Truco"]);
        setTruco(prev => ({
          ...prev,
          canto: "retruco",
          cantoNivel: 2,
          quienCanto: "P2",
          esperandoRespuesta: true,
          turnoAntesDelCanto: prev.turno,
          turno: "P1", // ahora vos respondés
        }));
        return; // NO juega la carta todavía
      }

      if (truco.canto === "retruco") {
        setCantosLog(prev => [...prev, "Bot: Quiero Vale Cuatro"]);
        setTruco(prev => ({
          ...prev,
          canto: "valecuatro",
          cantoNivel: 3,
          quienCanto: "P2",
          esperandoRespuesta: true,
          turnoAntesDelCanto: prev.turno,
          turno: "P1",
        }));
        return;
      }

      // Si ya es vale cuatro no sube más
    }
  }
}


  // =====================================================
  // 🟦 BOT CANTA TRUCO — PERMITIDO SOLO DESPUÉS DE QUE VOS
  //    TIRASTE UNA CARTA (table.length > 0)
  // =====================================================
  if (
    total > 0 &&            // vos ya tiraste
    !truco.canto &&         // no hay canto previo
    !truco.esperandoRespuesta
  ) {
    const evalBot = evaluateBotHand(hands[1]);

    let prob =
      evalBot.level === "muy_fuerte" ? 0.65 :
      evalBot.level === "fuerte"     ? 0.35 :
      evalBot.level === "media"      ? 0.12 :
      0.03;

    if (Math.random() < prob) {
      setCantosLog(prev => [...prev, "Bot: Truco"]);

      setTruco(prev => ({
        ...prev,
        canto: "truco",
        cantoNivel: 1,
        quienCanto: "P2",
        esperandoRespuesta: true,
        turnoAntesDelCanto: prev.turno, // 🟦 guardamos quien debía jugar
        turno: "P1"   // ahora respondés vos
      }));

      return; // ⛔ NO juega carta si cantó truco
    }
  }

  // =====================================================
  // 🟧 SI NO CANTÓ TRUCO → JUEGA CARTA NORMAL
  // =====================================================

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
    const start = w2 === "Parda" ? w1 : w2;

    if (start === "P2" && cardsInRound === 0) {
      setTimeout(() => opponentPlay(), 400);
      return;
    }

    if (cardsInRound === 1) {
      setTimeout(() => opponentPlay(), 400);
      return;
    }
  }
}, [
  truco.turno,
  truco.finished,
  truco.esperandoRespuesta,
  truco.canto,
  truco.winners,
  table,
  hands
]);


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

    const resultado = determineHandWinner(c1.card, c2.card);
    let ganador;

    if (resultado === "Parda") ganador = "Parda";
    else if (resultado === "P1") ganador = c1.from === 0 ? "P1" : "P2";
    else ganador = c2.from === 0 ? "P1" : "P2";

    setTruco((prev) => {
      const state = { ...prev, winners: [...prev.winners] };

      state.winners[roundIndex] = ganador;

      const mano = state.mano;
      const first = state.winners[0];
      const second = state.winners[1];

      // ========= RONDA 1 =========
      if (roundIndex === 0) {
        state.turno = ganador === "Parda" ? mano : ganador;
        return state;
      }

      // ========= RONDA 2 =========
      if (roundIndex === 1) {
        if (ganador === "Parda") {
          if (first === "P1" || first === "P2") {
            state.finished = true;
            state.ganadorPartida = first;
            state.turno = null;
            return state;
          }
          state.turno = mano;
          return state;
        }

        if (first === "Parda") {
          state.finished = true;
          state.ganadorPartida = ganador;
          state.turno = null;
          return state;
        }

        if (first === ganador) {
          state.finished = true;
          state.ganadorPartida = ganador;
          state.turno = null;
          return state;
        }

        state.turno = ganador;
        return state;
      }

      // ========= RONDA 3 =========
      if (roundIndex === 2) {
        let final;

        if (ganador === "Parda") {
          const p1 = [first, second].filter((w) => w === "P1").length;
          const p2 = [first, second].filter((w) => w === "P2").length;

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

    if (g === "P1") setPointsP1((p) => p + 1);
    if (g === "P2") setPointsP2((p) => p + 1);
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
        {/* Mensajes de canto arriba a la derecha */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            alignItems: "flex-end",
            zIndex: 999,
          }}
        >
          {cantosLog.slice(-4).map((msg, i) => (
            <div
              key={i}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                fontSize: "14px",
                border: "1px solid rgba(255,255,255,0.4)",
                textShadow: "0 1px 2px rgba(0,0,0,0.9)",
              }}
            >
              {msg}
            </div>
          ))}
        </div>

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
        {/* TRUCO: solo si no hay canto y es tu turno */}
        <button
          className="action-btn"
          disabled={
            !!truco.canto ||
            truco.finished ||
            truco.esperandoRespuesta ||
            truco.turno !== "P1"
          }
          onClick={() => {
            setCantosLog((prev) => [...prev, "Vos: Truco"]);
            setTruco((prev) => ({
              ...prev,
              canto: "truco",
              cantoNivel: 1,
              quienCanto: "P1",
              esperandoRespuesta: true,
              turno: "P2",
            }));
          }}
        >
          Truco
        </button>

        {/* RE TRUCO: solo si el último canto fue Truco del BOT */}
        <button
          className="action-btn"
          disabled={
            truco.finished ||
            truco.esperandoRespuesta ||
            truco.canto !== "truco" ||
            truco.quienCanto !== "P2"
          }
          onClick={() => {
            setCantosLog((prev) => [...prev, "Vos: Quiero Re Truco"]);
            setTruco((prev) => ({
              ...prev,
              canto: "retruco",
              cantoNivel: 2,
              quienCanto: "P1",
              esperandoRespuesta: true,
              turno: "P2",
            }));
          }}
        >
          Re Truco
        </button>

        {/* VALE CUATRO: solo si el último canto fue Re Truco del BOT */}
        <button
          className="action-btn"
          disabled={
            truco.finished ||
            truco.esperandoRespuesta ||
            truco.canto !== "retruco" ||
            truco.quienCanto !== "P2"
          }
          onClick={() => {
            setCantosLog((prev) => [...prev, "Vos: Quiero Vale Cuatro"]);
            setTruco((prev) => ({
              ...prev,
              canto: "valecuatro",
              cantoNivel: 3,
              quienCanto: "P1",
              esperandoRespuesta: true,
              turno: "P2",
            }));
          }}
        >
          Vale Cuatro
        </button>

        {/* Envidos los dejamos desactivados por ahora */}
        <button className="action-btn" disabled>
          Envido
        </button>
        <button className="action-btn" disabled>
          Real Envido
        </button>
        <button className="action-btn" disabled>
          Falta Envido
        </button>
        <button className="action-btn" disabled>
          Flor
        </button>

        {/* QUERER (cuando el BOT te cantó algo) */}
        <button
          className="action-btn"
          disabled={!truco.esperandoRespuesta || truco.turno !== "P1"}
          onClick={() => {
            const texto =
              truco.cantoNivel === 1
                ? "Vos: Quiero al Truco"
                : truco.cantoNivel === 2
                ? "Vos: Quiero al Re Truco"
                : "Vos: Quiero al Vale Cuatro";

            setCantosLog((prev) => [...prev, texto]);

            setTruco((prev) => ({
              ...prev,
              esperandoRespuesta: false,
              turno: prev.turnoAntesDelCanto,
            }));
          }}
        >
          Quiero
        </button>

        {/* NO QUERER */}
        <button
          className="action-btn"
          disabled={!truco.esperandoRespuesta || truco.turno !== "P1"}
          onClick={() => {
            const texto =
              truco.cantoNivel === 1
                ? "Vos: No quiero al Truco"
                : truco.cantoNivel === 2
                ? "Vos: No quiero al Re Truco"
                : "Vos: No quiero al Vale Cuatro";

            setCantosLog((prev) => [...prev, texto]);

            const puntos =
              truco.cantoNivel === 1
                ? 1
                : truco.cantoNivel === 2
                ? 2
                : 3;

            setPointsP2((p) => p + puntos);

            setTruco((prev) => ({
              ...prev,
              esperandoRespuesta: false,
              finished: true,
              ganadorPartida: "P2",
              turno: null,
            }));
          }}
        >
          No quiero
        </button>

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
