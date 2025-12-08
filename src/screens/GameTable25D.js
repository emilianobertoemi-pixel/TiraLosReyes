import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import AnotadorTruco from "../components/AnotadorTruco";
import "./table25d.css";

import { generateDeck, shuffle } from "../data/deck";
import { determineHandWinner } from "../gameLogic/truco/determineHandWinner";

// Evalúa la fuerza de la mano del BOT (para cantos)
function evaluateBotHand(hand) {
  if (!hand || hand.length === 0) {
    return { level: "mala" };
  }

  const ranks = hand.map((c) => c.rank);
  const hasAnchoEspada = hand.some(
    (c) => c.suit === "espada" && c.rank === 1
  );
  const hasAnchoBasto = hand.some(
    (c) => c.suit === "basto" && c.rank === 1
  );
  const hasSieteEspada = hand.some(
    (c) => c.suit === "espada" && c.rank === 7
  );
  const hasSieteOro = hand.some((c) => c.suit === "oro" && c.rank === 7);

  if (
    hasAnchoEspada ||
    (hasAnchoBasto && (hasSieteEspada || hasSieteOro))
  ) {
    return { level: "muy_fuerte" };
  }

  if (hasAnchoBasto || hasSieteEspada || hasSieteOro) {
    return { level: "fuerte" };
  }

  const fuertes = ranks.filter(
    (r) => r === 3 || r === 2 || r === 12 || r === 11 || r === 10
  );
  if (fuertes.length >= 2) {
    return { level: "media" };
  }

  return { level: "mala" };
}

// Mismo power que en determineHandWinner.js (duplicado para IA de cartas)
function getCardPower(card) {
  if (!card) return 0;
  const { rank, suit } = card;
  const r = parseInt(rank, 10);

  if (r === 1 && suit === "espada") return 14;
  if (r === 1 && suit === "basto") return 13;
  if (r === 7 && suit === "espada") return 12;
  if (r === 7 && suit === "oro") return 11;

  switch (r) {
    case 3:
      return 10;
    case 2:
      return 9;
    case 1:
      return 8; // 1 de copa/oro
    case 12:
      return 7;
    case 11:
      return 6;
    case 10:
      return 5;
    case 7:
      return 4; // 7 falso
    case 6:
      return 3;
    case 5:
      return 2;
    case 4:
      return 1;
    default:
      return 0;
  }
}

// Elige qué carta tira el BOT según la situación
function chooseBotCardIndex(botHand, table, truco) {
  if (!botHand || botHand.length === 0) return 0;

  const total = table.length;
  const ronda = Math.floor(total / 2); // 0,1,2
  const cardsInRound = total % 2; // 0 o 1

  // Si BOT inicia la ronda (cardsInRound === 0)
  if (cardsInRound === 0) {
    // Ordenamos por poder
    const sorted = botHand
      .map((c, idx) => ({ c, idx, power: getCardPower(c) }))
      .sort((a, b) => a.power - b.power); // ascendente

    if (ronda === 0) {
      // Ronda 1: usa la segunda más fuerte si puede, para guardar la mejor
      if (sorted.length >= 2) {
        return sorted[sorted.length - 2].idx;
      }
      return sorted[sorted.length - 1].idx;
    }

    if (ronda === 1) {
      const w1 = truco.winners[0];
      if (w1 === "P2") {
        // Ganó la primera → conserva, tira la más baja
        return sorted[0].idx;
      }
      // Perdió o parda → tira la más fuerte
      return sorted[sorted.length - 1].idx;
    }

    // Ronda 3: ya es todo o nada → tira la más fuerte
    return sorted[sorted.length - 1].idx;
  }

  // Si J1 ya tiró en esta ronda (cardsInRound === 1), BOT responde
  const last = table[table.length - 1];
  const cartaJugador = last.card;

  // Buscamos cartas que ganen a la del jugador
  const ganadoras = botHand
    .map((c, idx) => {
      const res = determineHandWinner(cartaJugador, c);
      const win = res === "P2";
      return { c, idx, win, power: getCardPower(c) };
    })
    .filter((x) => x.win)
    .sort((a, b) => a.power - b.power); // ganadora más baja posible

  if (ganadoras.length > 0) {
    return ganadoras[0].idx;
  }

  // Si no puede ganar, tira la peor
  const sorted = botHand
    .map((c, idx) => ({ c, idx, power: getCardPower(c) }))
    .sort((a, b) => a.power - b.power);

  return sorted[0].idx;
}

export default function GameTable25D() {
  const navigate = useNavigate();

  // ================= ESTADO GENERAL =================
  const [deck, setDeck] = useState(() => shuffle(generateDeck()));
  const [hands, setHands] = useState([[], []]); // [J1, J2]
  const [table, setTable] = useState([]); // cartas jugadas en orden

  const [truco, setTruco] = useState({
    mano: "P1",
    turno: "P1",
    winners: [null, null, null], // ganadores de cada ronda
    finished: false,
    ganadorPartida: null,

    // CANTOS
    canto: null, // "truco" | "retruco" | "valecuatro" | null
    cantoNivel: 0, // 0=sin canto, 1=truco, 2=retruco, 3=vale cuatro
    quienCanto: null, // "P1" o "P2"
    esperandoRespuesta: false,
    turnoAntesDelCanto: null,
  });

  const [pointsP1, setPointsP1] = useState(0);
  const [pointsP2, setPointsP2] = useState(0);

  const [cantosLog, setCantosLog] = useState([]);

  // Animación de reparto
  const [isDealing, setIsDealing] = useState(false);
  const [dealQueue, setDealQueue] = useState([]);
  const [dealIndex, setDealIndex] = useState(0);
  const [showPlayerCards, setShowPlayerCards] = useState(false);

  // ====================== REPARTIR (ANIMADO) ======================
  useEffect(() => {
    if (!isDealing) return;
    if (!dealQueue || dealQueue.length === 0) return;

    if (dealIndex >= dealQueue.length) {
      // Terminó de repartir
      setIsDealing(false);
      // turno inicial de la mano
      setTruco((prev) => ({
        ...prev,
        turno: "P1",
      }));
      return;
    }

    const timer = setTimeout(() => {
      const nextItem = dealQueue[dealIndex];

      setHands((prevHands) => {
        const newHands = prevHands.map((h) => [...h]);
        newHands[nextItem.playerIndex].push(nextItem.card);
        return newHands;
      });

      setDealIndex((prev) => prev + 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [isDealing, dealIndex, dealQueue]);

  const deal = () => {
    const d = [...shuffle(generateDeck())];

    setHands([[], []]);
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
      turnoAntesDelCanto: null,
    });

    setCantosLog([]);
    setShowPlayerCards(false);

    // Secuencia: J1, BT, J1, BT, ...
    const sequence = [];
    for (let i = 0; i < 3; i++) {
      const cardP1 = d.pop();
      const cardP2 = d.pop();
      sequence.push({ playerIndex: 0, card: cardP1 });
      sequence.push({ playerIndex: 1, card: cardP2 });
    }

    setDeck(d);
    setDealQueue(sequence);
    setDealIndex(0);
    setIsDealing(true);
  };

  // ================== JUGAR CARTA — J1 ==================
  const playCard = (playerIndex, cardIndex) => {
    if (truco.finished) return;
    if (truco.esperandoRespuesta) return;
    if (isDealing) return;
    if (playerIndex === 0 && truco.turno !== "P1") return;

    const carta = hands[playerIndex][cardIndex];
    if (!carta) return;

    const newHands = hands.map((h, idx) =>
      idx === playerIndex ? h.filter((_, i) => i !== cardIndex) : h
    );
    setHands(newHands);

    setTable((prev) => [...prev, { from: playerIndex, card: carta }]);

    setTruco((prev) => ({
      ...prev,
      turno: "P2",
    }));
  };

  // ================== JUGAR CARTA — BOT ==================
  const opponentPlay = (forcedIndex = null) => {
    if (truco.finished) return;
    if (truco.esperandoRespuesta) return;
    if (isDealing) return;
    if (truco.turno !== "P2") return;

    setHands((prevHands) => {
      const rival = prevHands[1];
      if (!rival || rival.length === 0) return prevHands;

      const idx =
        forcedIndex !== null && forcedIndex >= 0 && forcedIndex < rival.length
          ? forcedIndex
          : 0;
      const card = rival[idx];

      const newBotHand = rival.filter((_, i) => i !== idx);
      const updated = [prevHands[0], newBotHand];

      setTable((prev) => [...prev, { from: 1, card }]);

      setTruco((prev) => ({
        ...prev,
        turno: "P1",
      }));

      return updated;
    });
  };

  // ================== BOT RESPONDE CANTO (IA TRUCO) ==================
  const responderCantoBot = () => {
    if (!truco.esperandoRespuesta || truco.finished) return;

    const manoBot = hands[1] || [];
    const handEval = evaluateBotHand(manoBot);
    const nivel = truco.cantoNivel || 1;

    let probAceptar = 0.5;
    let probSubir = 0;

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
        turnoAntesDelCanto: prev.turno,
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
        turno: prev.turnoAntesDelCanto || "P1",
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

  // BOT responde a Truco / Re Truco / Vale Cuatro (con delay)
  useEffect(() => {
    if (!truco.esperandoRespuesta) return;
    if (truco.turno !== "P2") return;
    if (truco.finished) return;

    const timer = setTimeout(() => responderCantoBot(), 800);
    return () => clearTimeout(timer);
  }, [truco.esperandoRespuesta, truco.turno, truco.finished, hands]);

  // ================== LÓGICA DEL BOT (cantos + cartas) ==================
  useEffect(() => {
    if (truco.finished) return;
    if (isDealing) return;
    if (truco.esperandoRespuesta) return;

    const total = table.length;
    const ronda = Math.floor(total / 2);
    const cardsInRound = total % 2;
    const canBotAct = truco.turno === "P2";
    const manoBot = hands[1] || [];

    
    //--------------------------------------------------------------
// 🔥 PRIORIDAD ABSOLUTA: si hay carta pendiente, NO se puede cantar
//--------------------------------------------------------------
const hayCartaPendiente = cardsInRound === 1;

if (canBotAct && hayCartaPendiente) {
  // El bot debe SÍ O SÍ responder con una carta primero
  setTimeout(() => opponentPlay(), 400);
  return;
}
// Si el bot debe responder carta → responde y no cantará nada
if (hayCartaPendiente && canBotAct) {
  setTimeout(() => opponentPlay(), 400);
  return;
}

// Si NO es turno del bot → JAMÁS puede cantar
if (!canBotAct) {
  return; // que espere su turno
}

    if (!canBotAct || manoBot.length === 0) return;

    // ============ BOT: Me voy al mazo (si viene mal) ============
    if (!truco.canto) {
      const handEval = evaluateBotHand(manoBot);
      const perdioR1 = truco.winners[0] === "P1";

      if (
        handEval.level === "mala" &&
        perdioR1 &&
        manoBot.length >= 2 &&
        Math.random() < 0.07
      ) {
        setCantosLog((prev) => [...prev, "Bot: Me voy al mazo"]);
        setPointsP1((p) => p + 1);
        setTruco((prev) => ({
          ...prev,
          finished: true,
          ganadorPartida: "P1",
          turno: null,
        }));
        return;
      }
    }

    // ============ IA CANTOS: TRUCO / RETRUCO / VALE 4 ============
    // SOLO se puede cantar Truco si ya hubo al menos una acción (total > 0)
    if (!truco.canto && total > 0 && cardsInRound === 0) {
      const evalBot = evaluateBotHand(manoBot);

      let probTruco =
        evalBot.level === "muy_fuerte"
          ? 0.8
          : evalBot.level === "fuerte"
          ? 0.55
          : evalBot.level === "media"
          ? 0.25
          : 0.05;

      if (Math.random() < probTruco) {
        setCantosLog((prev) => [...prev, "Bot: Truco"]);
        setTruco((prev) => ({
          ...prev,
          canto: "truco",
          cantoNivel: 1,
          quienCanto: "P2",
          esperandoRespuesta: true,
          turnoAntesDelCanto: prev.turno,
          turno: "P1",
        }));
        return; // no tira carta hasta que respondas
      }
    } else if (truco.canto === "truco" && truco.quienCanto !== "P2" && cardsInRound === 0) {
      // Subir a Re Truco
      const evalBot = evaluateBotHand(manoBot);
      const ganoR1 = truco.winners[0] === "P2";

      let probReTruco =
        evalBot.level === "muy_fuerte"
          ? 0.65
          : evalBot.level === "fuerte"
          ? 0.45
          : evalBot.level === "media"
          ? 0.25
          : 0.05;

      if (ganoR1) probReTruco = Math.min(probReTruco + 0.2, 0.9);

      if (Math.random() < probReTruco) {
        setCantosLog((prev) => [...prev, "Bot: Quiero Re Truco"]);
        setTruco((prev) => ({
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
    } else if (truco.canto === "retruco" && truco.quienCanto !== "P2" && cardsInRound === 0) {

      // Subir a Vale Cuatro, especialmente si en la última carta gana
      let extraFuerte = false;
      if (hands[1].length === 1 && hands[0].length === 1) {
        const res = determineHandWinner(hands[0][0], hands[1][0]);
        extraFuerte = res === "P2";
      }

      let probVale4 = extraFuerte ? 0.7 : 0.15;

      if (Math.random() < probVale4) {
        setCantosLog((prev) => [...prev, "Bot: Quiero Vale Cuatro"]);
        setTruco((prev) => ({
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

    // ============ SI NO CANTA: LÓGICA PARA TIRAR CARTA ============
    // Dejamos que la lógica de rondas decida cuándo se termina la mano.
    // Acá solo tiramos carta cuando corresponde.

    // Delay suave para la carta del BOT
    const delay = 350;
    const idx = chooseBotCardIndex(manoBot, table, truco);

    // Condiciones por ronda
    if (ronda === 0) {
      // Ronda 1: BOT juega cuando vos ya tiraste (cardsInRound === 1)
      if (cardsInRound === 1) {
        const t = setTimeout(() => opponentPlay(idx), delay);
        return () => clearTimeout(t);
      }
      return;
    }

    if (ronda === 1) {
      const w1 = truco.winners[0];

      // Si ganó la primera y no se tiró ninguna en la segunda → arranca él
      if (w1 === "P2" && cardsInRound === 0) {
        const t = setTimeout(() => opponentPlay(idx), delay);
        return () => clearTimeout(t);
      }

      // Si vos tiraste en la ronda 2 -> responde
      if (cardsInRound === 1) {
        const t = setTimeout(() => opponentPlay(idx), delay);
        return () => clearTimeout(t);
      }

      return;
    }

    if (ronda === 2) {
      const w1 = truco.winners[0];
      const w2 = truco.winners[1];
      const start = w2 === "Parda" ? w1 : w2;

      // Si le toca comenzar la tercera
      if (start === "P2" && cardsInRound === 0) {
        const t = setTimeout(() => opponentPlay(idx), delay);
        return () => clearTimeout(t);
      }

      // Si vos tiraste la 3ra → responde
      if (cardsInRound === 1) {
        const t = setTimeout(() => opponentPlay(idx), delay);
        return () => clearTimeout(t);
      }
    }
  }, [truco, hands, table, isDealing]);

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
      {/* Humo suave encima del tapete */}
      <div className="humo-truco" />

      <AnotadorTruco puntosP1={pointsP1} puntosP2={pointsP2} />

      {/* CANTOS — cartelitos entre anotador y cartas del centro */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "360px",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "flex-start",
          zIndex: 3000,
          pointerEvents: "none",
        }}
      >
        {cantosLog.slice(-4).map((msg, i) => {
          let texto = msg;
          const lower = msg.toLowerCase();

          // Simplificar solo los "Quiero al ..." / "No quiero al ..."
          if (lower.includes("no quiero al ")) {
            texto = "No quiero";
          } else if (lower.includes("quiero al ")) {
            texto = "Quiero";
          }

          const esJugador = msg.startsWith("Vos");
          const esBot = msg.startsWith("Bot");

          const estilo = {
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "14px",
            textShadow: "0 1px 2px rgba(0,0,0,0.9)",
            whiteSpace: "pre-line",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            background: "rgba(0,0,0,0.75)",
          };

          if (esJugador) {
            estilo.background = "rgba(0, 90, 140, 0.85)";
            estilo.border = "1px solid rgba(100,180,255,0.8)";
          }
          if (esBot) {
            estilo.background = "rgba(140, 0, 0, 0.85)";
            estilo.border = "1px solid rgba(255,120,120,0.8)";
          }

          return (
            <div key={i} style={estilo}>
              {texto}
            </div>
          );
        })}
      </div>

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
              transform: "translate(-50%, -50%) scale(1.5)",
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
            faceUp={showPlayerCards}
            onClick={() => playCard(0, i)}
            style={{
              position: "relative",
              transform: `scale(1.5) rotate(${(i - 1) * 12}deg)`,
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
              turnoAntesDelCanto: prev.turno,
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
              turnoAntesDelCanto: prev.turno,
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
              turnoAntesDelCanto: prev.turno,
              turno: "P2",
            }));
          }}
        >
          Vale Cuatro
        </button>

        {/* Envidos desactivados por ahora */}
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

        {/* QUERER (canto de truco) */}
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
              turno: prev.turnoAntesDelCanto || "P1",
            }));
          }}
        >
          Quiero
        </button>

        {/* NO QUERER (canto de truco) */}
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

        {/* ME VOY AL MAZO (J1) */}
        <button
          className="action-btn"
          disabled={truco.finished || hands[0].length === 0}
          onClick={() => {
            setCantosLog((prev) => [...prev, "Vos: Me voy al mazo"]);
            setPointsP2((p) => p + 1);
            setTruco((prev) => ({
              ...prev,
              finished: true,
              ganadorPartida: "P2",
              turno: null,
            }));
          }}
        >
          Me voy al mazo
        </button>

        <div
          style={{
            width: "100%",
            height: "2px",
            background: "rgba(255,255,255,0.25)",
            margin: "15px 0",
          }}
        />

        <button
          className="system-btn"
          onClick={deal}
          disabled={isDealing}
        >
          Repartir
        </button>

        <button
          className="system-btn"
          onClick={() => setShowPlayerCards(true)}
          disabled={isDealing || showPlayerCards || hands[0].length === 0}
        >
          Ver mis cartas
        </button>

        <button className="system-btn" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
}