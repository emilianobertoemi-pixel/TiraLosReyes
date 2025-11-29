import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import AnotadorTruco from "../components/AnotadorTruco";
import "./table25d.css";

// 👉 USAMOS SOLO ESTE MAZO (el tuyo con imágenes)
import { generateDeck, shuffle } from "../data/deck";

export default function GameTable25D() {
  const navigate = useNavigate();

  // Por ahora 2 jugadores fijos
  const players = 2;

  // Mazo inicial: genero + mezclo UNA sola vez
  const [deck, setDeck] = useState(() => {
    const baseDeck = generateDeck();
    console.log("DECK INICIAL:", baseDeck);
    return shuffle(baseDeck);
  });

  // Manos de jugadores y cartas en la mesa
  const [hands, setHands] = useState(() =>
    Array.from({ length: players }, () => [])
  );
  const [tableCards, setTableCards] = useState([]);

  // ================================
  //   REPARTIR 3 CARTAS A CADA UNO
  // ================================
  const deal = () => {
    console.log("REPARTIR");

    let d = [...deck];

    // Si no alcanza el mazo, lo regeneramos
    if (d.length < players * 3) {
      console.log("Mazo agotado, regenerando...");
      d = shuffle(generateDeck());
    }

    const newHands = Array.from({ length: players }, () => []);

    for (let c = 0; c < 3; c++) {
      for (let p = 0; p < players; p++) {
        const card = d.pop();
        if (!card) continue;
        newHands[p].push(card);
      }
    }

    console.log("MANOS REPARTIDAS:", newHands);
    setHands(newHands);
    setDeck(d);
    setTableCards([]);
  };

  // ================================
  //      JUGAR UNA CARTA
  // ================================
  const playCard = (playerIndex, cardIndex) => {
    const card = hands[playerIndex]?.[cardIndex];
    if (!card) return;

    // Sacar la carta de la mano
    const newHands = hands.map((h, idx) =>
      idx === playerIndex ? h.filter((_, i) => i !== cardIndex) : h
    );

    setHands(newHands);
    setTableCards((prev) => [...prev, { ...card, from: playerIndex }]);
  };

   return (
  <div
    className="mesa25d-container"
    style={{
      backgroundImage: "url('/assets/backgrounds/tapete-mesa.jpg')",
    }}
  >
    {/* ANOTADOR */}
    <AnotadorTruco />
    


    {/* CARTAS JUGADAS EN EL CENTRO */}
    <div className="mesa25d-center">
      {tableCards.map((c, i) => (
        <Card
          key={c.id + "-" + i}
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
    <div className="player-hand-25d">
  {hands[0]?.map((card, i) => (
    <Card
      key={card.id}
      img={card.img}
      faceUp={true}
      onClick={() => playCard(0, i)}
      style={{
        position: "relative",
        left: `${i * 40}px`,
        rotate: `${(i - 1) * 12}deg`,
        zIndex: 50 + i,
      }}
    />
  ))}
</div>

    {/* MENÚ DERECHO */}
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

            <button className="system-btn" onClick={deal}>Repartir</button>
      <button className="system-btn" onClick={() => navigate(-1)}>Volver</button>
    </div>
  </div>
);   // ← cierre del return

}     // ← cierre del componente (ESTA FALTABA)



