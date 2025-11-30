import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import AnotadorTruco from "../components/AnotadorTruco";
import "./table25d.css";
import { generateDeck, shuffle } from "../data/deck";
import { compareCards } from "../utils/compareCards";

export default function GameTable25D() {
  const navigate = useNavigate();

  // Cantidad real de jugadores
  const query = new URLSearchParams(window.location.search);
  const players = parseInt(query.get("players") || 2);

  // Mazo inicial generado una sola vez
  const [deck, setDeck] = useState(() => shuffle(generateDeck()));

  // Manos según jugadores
  const [hands, setHands] = useState(
    Array.from({ length: players }, () => [])
  );

  // Todas las cartas jugadas agrupadas por manos
  const [tableTricks, setTableTricks] = useState([]);

  // Mano actual (1, 2 o 3)
  const [currentTrick, setCurrentTrick] = useState(1);

  // Registro de ganadores de cada mano: "P1", "P2", "Parda"
  const [trickWinners, setTrickWinners] = useState([]);

  // Puntos
  const [pointsP1, setPointsP1] = useState(0);
  const [pointsP2, setPointsP2] = useState(0);

  // ============================================
  //                 REPARTIR
  // ============================================
  const deal = () => {
    let d = [...deck];

    if (d.length < players * 3) {
      d = shuffle(generateDeck());
    }

    const newHands = Array.from({ length: players }, () => []);

    for (let c = 0; c < 3; c++) {
      for (let p = 0; p < players; p++) {
        const card = d.pop();
        if (card) newHands[p].push(card);
      }
    }

    setHands(newHands);
    setDeck(d);
    setTableTricks([]);     // limpiamos la mesa recién ahora
    setCurrentTrick(1);
    setTrickWinners([]);
  };

  // ============================================
  //            JUGAR UNA CARTA (TUYA)
  // ============================================
  const playCard = (playerIndex, cardIndex) => {
    const card = hands[playerIndex]?.[cardIndex];
    if (!card) return;

    const newHands = hands.map((h, idx) =>
      idx === playerIndex ? h.filter((_, i) => i !== cardIndex) : h
    );

    setHands(newHands);

    // Agregar carta a la mesa en la mano actual
    setTableTricks(prev => {
      const updated = [...prev];

      if (!updated[currentTrick - 1]) {
        updated[currentTrick - 1] = { trick: currentTrick, cards: [] };
      }

      updated[currentTrick - 1].cards.push({ ...card, from: playerIndex });
      return updated;
    });

    // Si jugás vos (P1) → el otro responde
    if (playerIndex === 0 && players >= 2) {
      setTimeout(() => {
        opponentPlay();
      }, 600);
    }
  };

  // ============================================
  //              JUEGA EL RIVAL
  // ============================================
  // JUEGA EL RIVAL
const opponentPlay = (trickOverride = null) => {
  setHands((prevHands) => {
    const rivalHand = prevHands[1];
    if (!rivalHand || rivalHand.length === 0) return prevHands;

    const rivalCard = rivalHand[0];

    const updatedHands = [
      [...prevHands[0]],      // tu mano igual
      rivalHand.slice(1),     // rival sin la primera carta
    ];

    setTableTricks((prev) => {
      const updated = [...prev];

      // si me pasan un número de mano, uso ese; si no, uso la actual
      const trickNumber = trickOverride ?? currentTrick;
      const trickIndex = trickNumber - 1;

      if (!updated[trickIndex]) {
        updated[trickIndex] = { trick: trickNumber, cards: [] };
      }

      updated[trickIndex].cards.push({ ...rivalCard, from: 1 });

      return updated;
    });

    return updatedHands;
  });
};


  // FIN PARTE 1
  // ============================================
  //     LÓGICA COMPLETA DEL TRUCO (1ra, 2da, 3ra)
  // ============================================
  useEffect(() => {
    const manoActual = tableTricks[currentTrick - 1];

    // Esperar a que haya 2 cartas jugadas en esta mano
    if (!manoActual || manoActual.cards.length < 2) return;

    const [c1, c2] = manoActual.cards;
    const result = compareCards(c1, c2);

    const winner =
      result === 1 ? "P1" :
      result === -1 ? "P2" :
      "Parda";

    console.log(`Mano ${currentTrick}: ${winner}`);

    setTrickWinners(prev => [...prev, winner]);

    setTimeout(() => {
      // =========================
      //         1° MANO
      // =========================
      // =========================
//         1° MANO
// =========================
if (currentTrick === 1) {
  const nextTrick = 2;

  if (winner === "P1") {
    // Vos ganaste la primera → vos empezás la segunda
    setCurrentTrick(nextTrick);
    return;
  }

  if (winner === "P2") {
    // El rival ganó la primera → él empieza la segunda
    setCurrentTrick(nextTrick);

    setTimeout(() => {
      opponentPlay(nextTrick); // 👈 juega de MANO en la 2° mano
    }, 600);

    return;
  }

  if (winner === "Parda") {
    // Parda en la 1° → sigue el orden normal, arrancás vos
    setCurrentTrick(nextTrick);
    return;
  }
}

      // =========================
      //         2° MANO
      // =========================
      if (currentTrick === 2) {
        const first = trickWinners[0];

        if (winner === "P1" || winner === "P2") {
          endRound(winner);
          return;
        }

        if (winner === "Parda") {
          endRound(first);
          return;
        }

        setCurrentTrick(3);
        return;
      }

      // =========================
      //         3° MANO
      // =========================
      if (currentTrick === 3) {
        const first = trickWinners[0];

        if (winner === "P1" || winner === "P2") {
          endRound(winner);
          return;
        }

        if (winner === "Parda") {
          endRound(first);
          return;
        }
      }

    }, 900);
  }, [tableTricks]);


  // ============================================
  //             GANADOR DE LA RONDA
  // ============================================
  const endRound = (winner) => {
    console.log("GANADOR DE LA RONDA:", winner);

    if (winner === "P1") setPointsP1(p => p + 1);
    if (winner === "P2") setPointsP2(p => p + 1);

    setTimeout(() => {
      deal();
    }, 1200);
  };

  // FIN PARTE 2

    // ============================================
  //                RENDER
  // ============================================
  return (
    <div
      className="mesa25d-container"
      style={{
        backgroundImage: "url('/assets/backgrounds/tapete-mesa.jpg')",
      }}
    >
      <AnotadorTruco
        puntosP1={pointsP1}
        puntosP2={pointsP2}
      />

      {/* CARTAS EN EL CENTRO */}
      <div className="mesa25d-center">
        {tableTricks.map((mano, trickIndex) =>
          mano.cards.map((c, i) => (
            <Card
              key={c.id + "-" + trickIndex}
              img={c.img}
              faceUp={true}
              style={{
                position: "absolute",

                top: `${-50 + trickIndex * 70}px`,
                left: `${i * 40}px`,

                transform: "translate(-50%, -50%)",
                zIndex: trickIndex * 10 + i,
              }}
            />
          ))
        )}
      </div>

      {/* MANO DEL RIVAL */}
      <div className="opponent-hand">
        {hands[1]?.map((card, i) => (
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
        {hands[0]?.map((card, i) => (
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

