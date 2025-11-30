import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import AnotadorTruco from "../components/AnotadorTruco";
import "./table25d.css";

import { generateDeck, shuffle } from "../data/deck";

import { determineHandWinner } from "../gameLogic/truco/determineHandWinner";
import { determineRoundWinner } from "../gameLogic/truco/determineRoundWinner";
import { nextPlayerAfterFirstHand } from "../gameLogic/truco/turnManager";

export default function GameTable25D() {
  const navigate = useNavigate();

  // Cantidad de jugadores (por ahora 2)
  const query = new URLSearchParams(window.location.search);
  const players = parseInt(query.get("players") || 2);

  // Mazo inicial
  const [deck, setDeck] = useState(() => shuffle(generateDeck()));

  // Manos
  const [hands, setHands] = useState(
    Array.from({ length: players }, () => [])
  );

  // Mesa (todas las cartas jugadas, agrupadas por mano)
  const [table, setTable] = useState([]);

  // Mano actual (1, 2 o 3)
  const [currentTrick, setCurrentTrick] = useState(1);

  // Ganadores de las manos ["P1", "P2", "Parda"]
  const [trickWinners, setTrickWinners] = useState([]);

  // Quién es mano en esta ronda
  const [mano, setMano] = useState("P1"); // empieza siempre P1 en la primera ronda

  // Puntos
  const [pointsP1, setPointsP1] = useState(0);
  const [pointsP2, setPointsP2] = useState(0);

  // ============================================
  //                 REPARTIR
  // ============================================
  const deal = (nextMano = mano) => {
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
    setTable([]);
    setTrickWinners([]);
    setCurrentTrick(1);
    setMano(nextMano);
  };

  // ============================================
  //            JUGAR UNA CARTA (TUYA)
  // ============================================
  const playCard = (playerIndex, cardIndex) => {
    const card = hands[playerIndex]?.[cardIndex];
    if (!card) return;

    const newHands = hands.map((hand, idx) =>
      idx === playerIndex ? hand.filter((_, i) => i !== cardIndex) : hand
    );
    setHands(newHands);

    setTable((prev) => {
      const updated = [...prev];
      if (!updated[currentTrick - 1]) {
        updated[currentTrick - 1] = { trick: currentTrick, cards: [] };
      }
      updated[currentTrick - 1].cards.push({ ...card, from: playerIndex });
      return updated;
    });

    if (playerIndex === 0 && players >= 2) {
      setTimeout(() => {
        opponentPlay();
      }, 600);
    }
  };

  // ============================================
  //              JUEGA EL RIVAL
  // ============================================
  const opponentPlay = () => {
    setHands((prevHands) => {
      const rivalHand = prevHands[1];
      if (!rivalHand || rivalHand.length === 0) return prevHands;

      const rivalCard = rivalHand[0];

      const updatedHands = [
        [...prevHands[0]],
        rivalHand.slice(1),
      ];

      setTable((prev) => {
        const updated = [...prev];

        if (!updated[currentTrick - 1]) {
          updated[currentTrick - 1] = { trick: currentTrick, cards: [] };
        }

        updated[currentTrick - 1].cards.push({ ...rivalCard, from: 1 });
        return updated;
      });

      return updatedHands;
    });
  };

  // ============================================
  //     LÓGICA COMPLETA DEL TRUCO (1ra, 2da, 3ra)
  // ============================================
  useEffect(() => {
    const manoActual = table[currentTrick - 1];
    if (!manoActual || manoActual.cards.length < 2) return;

    const [c1, c2] = manoActual.cards;
    const winner = determineHandWinner(c1, c2);

    setTrickWinners((prev) => [...prev, winner]);

    setTimeout(() => {
      // 1° MANO
      if (currentTrick === 1) {
        setCurrentTrick(2);
        if (winner === "P2") {
          setTimeout(() => opponentPlay(), 600);
        }
        return;
      }

      // 2° MANO
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

      // 3° MANO
      if (currentTrick === 3) {
        const first = trickWinners[0];
        const roundWinner = winner === "Parda" ? first : winner;
        endRound(roundWinner);
      }

    }, 800);

  }, [table]);

  // ============================================
  //             GANADOR DE LA RONDA
  // ============================================
  const endRound = (winner) => {
    if (winner === "P1") setPointsP1((p) => p + 1);
    if (winner === "P2") setPointsP2((p) => p + 1);

    const nextMano = winner; // regla B que vos pediste

    setTimeout(() => {
      deal(nextMano);
    }, 1200);
  };

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
      <AnotadorTruco puntosP1={pointsP1} puntosP2={pointsP2} />

      {/* CARTAS EN MESA */}
      <div className="mesa25d-center">
        {table.map((mano, trickIndex) =>
          mano.cards.map((c, i) => (
            <Card
              key={c.id + "-" + trickIndex + "-" + i}
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

      {/* MENÚ */}
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

        <button className="system-btn" onClick={() => deal(mano)}>
          Repartir
        </button>
        <button className="system-btn" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
}
