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
  if (!hand || hand.length === 0) return { level: "mala" };

  const ranks = hand.map((c) => c.rank);
  const hasAnchoEspada = hand.some((c) => c.suit === "espada" && c.rank === 1);
  const hasAnchoBasto = hand.some((c) => c.suit === "basto" && c.rank === 1);
  const hasSieteEspada = hand.some((c) => c.suit === "espada" && c.rank === 7);
  const hasSieteOro = hand.some((c) => c.suit === "oro" && c.rank === 7);

  if (hasAnchoEspada || (hasAnchoBasto && (hasSieteEspada || hasSieteOro)))
    return { level: "muy_fuerte" };

  if (hasAnchoBasto || hasSieteEspada || hasSieteOro)
    return { level: "fuerte" };

  const fuertes = ranks.filter(
    (r) => r === 3 || r === 2 || r === 12 || r === 11 || r === 10
  );

  if (fuertes.length >= 2) return { level: "media" };

  return { level: "mala" };
}

export default function GameTable25D() {
  const navigate = useNavigate();

  // ================= ESTADOS =================
  const [deck, setDeck] = useState(() => shuffle(generateDeck()));
  const [hands, setHands] = useState([[], []]);
  const [table, setTable] = useState([]);

  const [truco, setTruco] = useState({
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

  const [pointsP1, setPointsP1] = useState(0);
  const [pointsP2, setPointsP2] = useState(0);

  const [cantosLog, setCantosLog] = useState([]);

  // Reparto animado
  const [isDealing, setIsDealing] = useState(false);
  const [dealQueue, setDealQueue] = useState([]);
  const [dealIndex, setDealIndex] = useState(0);
  const [showPlayerCards, setShowPlayerCards] = useState(false);

  // ====================== REPARTIR (ANIMADO) ======================
  useEffect(() => {
    if (!isDealing || dealIndex >= dealQueue.length) {
      setIsDealing(false);
      return;
    }

    const timer = setTimeout(() => {
      const next = dealQueue[dealIndex];
      setHands((prev) => {
        const newHands = prev.map((h) => [...h]);
        newHands[next.playerIndex].push(next.card);
        return newHands;
      });
      setDealIndex((i) => i + 1);
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

    const seq = [];
    for (let i = 0; i < 3; i++) {
      seq.push({ playerIndex: 0, card: d.pop() });
      seq.push({ playerIndex: 1, card: d.pop() });
    }

    setDeck(d);
    setDealQueue(seq);
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

    setTruco((prev) => ({ ...prev, turno: "P2" }));
  };

  // ================== JUGAR CARTA — BOT ==================
  const opponentPlay = () => {
    if (truco.finished) return;
    if (truco.esperandoRespuesta) return;
    if (isDealing) return;
    if (truco.turno !== "P2") return;

    setHands((prev) => {
      const bot = prev[1];
      if (!bot.length) return prev;

      const card = bot[0];
      const updated = [prev[0], bot.slice(1)];

      setTable((prevT) => [...prevT, { from: 1, card }]);
      setTruco((prevT) => ({ ...prevT, turno: "P1" }));

      return updated;
    });
  };

  // ================== BOT RESPONDE CANTO ==================
  const responderCantoBot = () => {
    if (!truco.esperandoRespuesta || truco.finished) return;

    const manoBot = hands[1] || [];
    const evalBot = evaluateHand(manoBot);
    const nivel = truco.cantoNivel || 1;

    let probAceptar = 0.5;
    let probSubir = 0;

    if (nivel === 1) {
      if (evalBot.level === "muy_fuerte") {
        probAceptar = 0.95;
        probSubir = 0.45;
      } else if (evalBot.level === "fuerte") {
        probAceptar = 0.85;
        probSubir = 0.25;
      } else if (evalBot.level === "media") {
        probAceptar = 0.6;
        probSubir = 0.05;
      } else probAceptar = 0.35;
    }

    if (nivel === 2) {
      if (evalBot.level === "muy_fuerte") probAceptar = 0.9;
      else if (evalBot.level === "fuerte") probAceptar = 0.75;
      else if (evalBot.level === "media") probAceptar = 0.5;
      else probAceptar = 0.25;

      probSubir = evalBot.level === "muy_fuerte" ? 0.3 : 0.1;
    }

    const r = Math.random();
    const puedeSubir = nivel < 3;

    // SUBIR
    if (puedeSubir && r < probSubir) {
      const nextNivel = nivel + 1;
      const canto =
        nextNivel === 2 ? "retruco" : "valecuatro";

      setCantosLog((prev) => [
        ...prev,
        nextNivel === 2
          ? "Bot: Quiero Re Truco"
          : "Bot: Quiero Vale Cuatro",
      ]);

      setTruco((prev) => ({
        ...prev,
        canto,
        cantoNivel: nextNivel,
        quienCanto: "P2",
        esperandoRespuesta: true,
        turnoAntesDelCanto: prev.turno,
        turno: "P1",
      }));
      return;
    }

    // QUIERE
    if (r < probAceptar) {
      setCantosLog((prev) => [
        ...prev,
        nivel === 1
          ? "Bot: Quiero al Truco"
          : nivel === 2
          ? "Bot: Quiero al Re Truco"
          : "Bot: Quiero al Vale Cuatro",
      ]);

      setTruco((prev) => ({
        ...prev,
        esperandoRespuesta: false,
        turno: "P1",
      }));
      return;
    }

    // NO QUIERE
    setCantosLog((prev) => [
      ...prev,
      nivel === 1
        ? "Bot: No quiero al Truco"
        : nivel === 2
        ? "Bot: No quiero al Re Truco"
        : "Bot: No quiero al Vale Cuatro",
    ]);

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

  useEffect(() => {
    if (truco.esperandoRespuesta && truco.turno === "P2") {
      const t = setTimeout(() => responderCantoBot(), 800);
      return () => clearTimeout(t);
    }
  }, [truco.esperandoRespuesta, truco.turno]);

  // ================== IA BOT: CANTOS + TIRAR ==================
  useEffect(() => {
    if (truco.finished || truco.esperandoRespuesta) return;

    // ================= BOT: Me voy al mazo (rendición automática) ==================
if (!truco.finished && !truco.esperandoRespuesta && truco.turno === "P2") {

  const evalBot = evaluateHand(hands[1]);

  // Condiciones:
  // - mano muy mala
  // - perdió la primera ronda
  // - tiene al menos 2 cartas aún
  const perdioR1 = truco.winners[0] === "P1";

  if (
    evalBot.level === "mala" &&
    perdioR1 &&
    hands[1].length >= 2
  ) {
    // probabilidad de rendirse
    if (Math.random() < 0.05) {   // 5%
      setCantosLog(prev => [...prev, "Bot: Me voy al mazo"]);
      setPointsP1(p => p + 1);   // vos ganás 1 punto
      setTruco(prev => ({
        ...prev,
        finished: true,
        ganadorPartida: "P1",
        turno: null,
      }));
      return;  // 👈 importantísimo
    }
  }
}


    const total = table.length;
    const ronda = Math.floor(total / 2);
    const cardsInRound = total % 2;
    const canBotAct = truco.turno === "P2";
    const manoBot = hands[1];

    // BOT inicia TRUCO SOLO si J1 ya hizo una acción
    if (!truco.canto && canBotAct && total > 0 && manoBot.length === 3) {
      const evalBot = evaluateHand(manoBot);

      let prob =
        evalBot.level === "muy_fuerte"
          ? 0.9
          : evalBot.level === "fuerte"
          ? 0.7
          : evalBot.level === "media"
          ? 0.25
          : 0.05;

      if (Math.random() < prob) {
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
        return;
      }
    }

    // SUBIR A RETRUCO
    if (
      truco.canto === "truco" &&
      truco.quienCanto !== "P2" &&
      canBotAct &&
      manoBot.length >= 2
    ) {
      const evalBot = evaluateHand(manoBot);
      const botGanoR1 = truco.winners[0] === "P2";

      let prob =
        evalBot.level === "muy_fuerte"
          ? 0.7
          : evalBot.level === "fuerte"
          ? 0.5
          : evalBot.level === "media"
          ? 0.25
          : 0.05;

      if (botGanoR1) prob += 0.15;

      if (Math.random() < prob) {
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
    }

    // SUBIR A VALE CUATRO
    if (
      truco.canto === "retruco" &&
      truco.quienCanto !== "P2" &&
      canBotAct
    ) {
      let extra = false;

      if (hands[1].length === 1 && hands[0].length === 1) {
        extra =
          determineHandWinner(hands[1][0], hands[0][0]) === "P2";
      }

      const prob = extra ? 0.7 : 0.15;

      if (Math.random() < prob) {
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

    // SI NO CANTA, TIRA CARTA
    if (!canBotAct) return;

    if (ronda === 0) {
      if (cardsInRound === 1) setTimeout(() => opponentPlay(), 400);
      return;
    }

    if (ronda === 1) {
      const w1 = truco.winners[0];

      if (w1 === "P2" && cardsInRound === 0) {
        setTimeout(() => opponentPlay(), 400);
        return;
      }
      if (cardsInRound === 1) {
        setTimeout(() => opponentPlay(), 400);
      }
      return;
    }

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
  }, [truco, hands, table]);

  // ================== LÓGICA DE RONDAS ==================
  useEffect(() => {
    if (truco.finished || table.length === 0) return;
    if (table.length % 2 !== 0) return;

    const index = table.length / 2 - 1;
    if (index < 0 || index > 2) return;
    if (truco.winners[index]) return;

    const c1 = table[index * 2];
    const c2 = table[index * 2 + 1];
    const result = determineHandWinner(c1.card, c2.card);

    setTruco((prev) => {
      const state = { ...prev, winners: [...prev.winners] };
      let ganador;

      if (result === "Parda") ganador = "Parda";
      else ganador = result;

      state.winners[index] = ganador;

      const mano = state.mano;
      const first = state.winners[0];
      const second = state.winners[1];

      if (index === 0) {
        state.turno = ganador === "Parda" ? mano : ganador;
        return state;
      }

      if (index === 1) {
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

      if (index === 2) {
        let final;

        if (ganador === "Parda") {
          const p1 = [first, second].filter((w) => w === "P1").length;
          const p2 = [first, second].filter((w) => w === "P2").length;

          if (p1 > p2) final = "P1";
          else if (p2 > p1) final = "P2";
          else final = mano;
        } else final = ganador;

        state.finished = true;
        state.ganadorPartida = final;
        state.turno = null;
        return state;
      }

      return state;
    });
  }, [table, truco.mano, truco.finished]);

  useEffect(() => {
    const g = truco.ganadorPartida;
    if (!g) return;

    if (g === "P1") setPointsP1((p) => p + 1);
    else setPointsP2((p) => p + 1);
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

      {/* Humo ambiental */}
      <div className="humo-truco"></div>

      {/* CANTOS — cartelitos a la izquierda */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "360px",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 3000,
          pointerEvents: "none",
        }}
      >
        {cantosLog.slice(-4).map((msg, i) => {
          let texto = msg;
          const lower = msg.toLowerCase();

          // Simplificamos solo los "quiero/no quiero"
          if (lower.includes("no quiero al ")) texto = "No quiero";
          if (lower.includes("quiero al ")) texto = "Quiero";

          const esJugador = msg.startsWith("Vos");
          const esBot = msg.startsWith("Bot");

          const estilo = {
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            background: "rgba(0,0,0,0.75)",
            textShadow: "0 1px 2px rgba(0,0,0,0.9)",
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
      <div className="player-hand-25d">
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

        {/* QUIERO */}
        <button
          className="action-btn"
          disabled={!truco.esperandoRespuesta || truco.turno !== "P1"}
          onClick={() => {
            const txt =
              truco.cantoNivel === 1
                ? "Vos: Quiero al Truco"
                : truco.cantoNivel === 2
                ? "Vos: Quiero al Re Truco"
                : "Vos: Quiero al Vale Cuatro";

            setCantosLog((prev) => [...prev, txt]);

            setTruco((prev) => ({
              ...prev,
              esperandoRespuesta: false,
              turno: prev.turnoAntesDelCanto,
            }));
          }}
        >
          Quiero
        </button>

        {/* NO QUIERO */}
        <button
          className="action-btn"
          disabled={!truco.esperandoRespuesta || truco.turno !== "P1"}
          onClick={() => {
            const txt =
              truco.cantoNivel === 1
                ? "Vos: No quiero al Truco"
                : truco.cantoNivel === 2
                ? "Vos: No quiero al Re Truco"
                : "Vos: No quiero al Vale Cuatro";

            setCantosLog((prev) => [...prev, txt]);

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
        <button
  className="action-btn"
  onClick={() => {
    setCantosLog(prev => [...prev, "Vos: Me voy al mazo"]);
    setPointsP2(p => p + 1);      // BOT suma 1 punto
    setTruco(prev => ({
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
