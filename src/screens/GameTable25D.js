import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import AnotadorTruco from "../components/AnotadorTruco";   // ← NUEVO
import "./table25d.css";

export default function GameTable25D() {
  const navigate = useNavigate();

  const query = new URLSearchParams(window.location.search);
  const players = parseInt(query.get("players") || 2);

  const ranks = ["1", "2", "3", "4", "5", "6", "7", "10", "11", "12"];
  const suits = ["♥", "♦", "♣", "♠"];

  const generateDeck = () => {
    let id = 1;
    const deck = [];
    for (const r of ranks) {
      for (const s of suits) {
        deck.push({ id: id++, rank: `${r}${s}` });
      }
    }
    return deck;
  };

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const [deck, setDeck] = useState(shuffle(generateDeck()));
  const [hands, setHands] = useState(Array.from({ length: players }, () => []));
  const [tableCards, setTableCards] = useState([]);

  const deal = () => {
    const newHands = Array.from({ length: players }, () => []);
    let d = [...deck];

    for (let c = 0; c < 3; c++) {
      for (let p = 0; p < players; p++) {
        newHands[p].push(d.pop());
      }
    }

    setHands(newHands);
    setDeck(d);
    setTableCards([]);
  };

  const playCard = (playerIndex, cardIndex) => {
    const card = hands[playerIndex][cardIndex];
    if (!card) return;

    const newHands = hands.map((h) => [...h]);
    newHands[playerIndex].splice(cardIndex, 1);

    setHands(newHands);
    setTableCards([...tableCards, { ...card, from: playerIndex }]);
  };

  return (
    <div
      className="mesa25d-container"
      style={{
        backgroundImage: "url('/assets/backgrounds/tapete-mesa.jpg')",
      }}
    >

      {/* 🔥 Marcador del Truco (nuevo anotador estilizado) */}
      <AnotadorTruco className="anotador-lateral" />

      {/* Cartas jugadas en el centro */}
      <div className="mesa25d-center">
        {tableCards.map((c, i) => (
          <Card
            key={c.id + "-" + i}
            rank={c.rank}
            faceUp={true}
            style={{
              left: `${i * 50}px`,
              top: `${i * 10}px`,
              position: "absolute",
              transform: "translate(-50%, -50%)",
              zIndex: 30 + i
            }}
          />
        ))}
      </div>

      {/* Mano rival (arriba) */}
      <div className="opponent-hand">
        {hands[1] &&
          hands[1].map((card, i) => (
            <Card
              key={card.id}
              rank={card.rank}
              faceUp={false}
              style={{
                transform: `translateX(${i * 20}px) rotate(180deg)`
              }}
            />
          ))}
      </div>

      {/* Mano propia */}
      <div className="player-hand-25d">
        {hands[0] &&
          hands[0].map((card, i) => (
            <Card
              key={card.id}
              rank={card.rank}
              faceUp={true}
              onClick={() => playCard(0, i)}
              style={{
                transform: `translateY(-20px) rotate(${(i - 1) * 12}deg)`,
                zIndex: 50 + i,
              }}
            />
          ))}
      </div>

      {/* MENÚ DERECHO: Cantos del Truco + Controles */}
      <div className="side-menu-25d">

        {/* Cantos del truco */}
        <button className="action-btn">Truco</button>
        <button className="action-btn">Quiero Re Truco</button>
        <button className="action-btn">Quiero Vale Cuatro</button>
        <button className="action-btn">Envido</button>
        <button className="action-btn">Real Envido</button>
        <button className="action-btn">Falta Envido</button>
        <button className="action-btn">Flor</button>
        <button className="action-btn">Quiero</button>
        <button className="action-btn">No quiero</button>

        {/* Separador */}
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "rgba(255,255,255,0.25)",
            margin: "15px 0"
          }}
        />

        {/* Controles */}
        <button className="system-btn" onClick={deal}>Repartir</button>
        <button className="system-btn" onClick={() => navigate(-1)}>Volver</button>

      </div>
    </div>
  );
}
