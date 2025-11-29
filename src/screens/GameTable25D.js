import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import AnotadorTruco from "../components/AnotadorTruco";
import "./table25d.css";
import { generateDeck, shuffle } from "../data/deck";

export default function GameTable25D() {
  const navigate = useNavigate();

  // 🔥 Cantidad real de jugadores desde la URL
  const query = new URLSearchParams(window.location.search);
  const players = parseInt(query.get("players") || 2);

  // 🔥 Mazo inicial generado UNA SOLA VEZ
  const [deck, setDeck] = useState(() => shuffle(generateDeck()));

  // 🔥 Manos según la cantidad real de jugadores
  const [hands, setHands] = useState(
    Array.from({ length: players }, () => [])
  );

  const [tableCards, setTableCards] = useState([]);
  const [opponentThinking, setOpponentThinking] = useState(false);

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
    setTableCards([]);
  };

  // ============================================
  //            JUGAR UNA CARTA (TUYA)
  // ============================================
  // ============================================
//            JUGAR UNA CARTA (TUYA)
// ============================================
const playCard = (playerIndex, cardIndex) => {
  const card = hands[playerIndex]?.[cardIndex];
  if (!card) return;

  // Sacar la carta de la mano (como antes, cuando andaba bien)
  const newHands = hands.map((h, idx) =>
    idx === playerIndex ? h.filter((_, i) => i !== cardIndex) : h
  );

  setHands(newHands);

  // Poner la carta en la mesa
  setTableCards(prev => [...prev, { ...card, from: playerIndex }]);

  // 👇 SOLO si jugás vos (jugador 0), que juegue el rival
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
  setHands(prevHands => {
    const rivalHand = prevHands[1];
    if (!rivalHand || rivalHand.length === 0) return prevHands;

    const rivalCard = rivalHand[0];

    const updatedHands = [
      [...prevHands[0]],      // tu mano igual
      rivalHand.slice(1),     // rival sin la primera carta
    ];

    // Carta del rival a la mesa
    setTableCards(prev => [...prev, { ...rivalCard, from: 1 }]);

    return updatedHands;
  });
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
      <AnotadorTruco />

      {/* CARTAS EN EL CENTRO */}
      <div className="mesa25d-center">
        {tableCards.map((c, i) => (
          <Card
  key={c.uid}

  img={c.img}
  faceUp={true}
            style={{
              left: `${i * 40}px`,
              top: `${i * 10}px`,
              position: "absolute",
              transform: "translate(-50%, -50%)",
              zIndex: 30 + i,
            }}
          />
        ))}
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
<div className="player-hand-25d" style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "15px" }}>
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
        <button className="action-btn">Quiero Re Truco</button>
        <button className="action-btn">Quiero Vale Cuatro</button>
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
