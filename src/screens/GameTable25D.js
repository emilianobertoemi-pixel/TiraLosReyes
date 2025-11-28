import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import "./table25d.css"; // lo creamos en el paso 2

export default function GameTable25D() {
  const navigate = useNavigate();

  const query = new URLSearchParams(window.location.search);
  const players = parseInt(query.get("players") || 2);

  // mazo simple (luego lo reemplazamos)
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

  // manos por jugador
  const [hands, setHands] = useState(
    Array.from({ length: players }, () => [])
  );

  // cartas jugadas en mesa
  const [tableCards, setTableCards] = useState([]);

  // repartir
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
      {/* Nombre arriba */}
      <h1 className="mesa25d-title">TIRA LOS REYES</h1>

      {/* Tapete 2.5D */}
      <div className="mesa25d-tapete">

        {/* Cartas del rival (solo si hay 2 jugadores por ahora) */}
        <div className="opponent-hand">
          {hands[1] &&
            hands[1].map((card, i) => (
              <Card
                key={card.id}
                rank={card.rank}
                faceUp={false} // ocultas del rival
                style={{
                  transform: `translateX(${i * 20}px) rotate(180deg)`
                }}
              />
            ))}
        </div>

        {/* Cartas jugadas al centro */}
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
                transform: "translate(-50%, -50%)"
              }}
            />
          ))}
        </div>
      </div>

      {/* Mano propia en primer plano */}
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

      {/* Menú lateral */}
      <div className="side-menu-25d">
        <button className="action-btn">Truco</button>
        <button className="action-btn">Envido</button>
        <button className="action-btn">Real Envido</button>
        <button className="action-btn">Falta Envido</button>
        <button className="action-btn">Flor</button>
      </div>

      {/* Controles de la partida */}
      <div className="control-bar-25d">
        <button className="casio-btn" onClick={deal}>Repartir</button>
        <button className="casio-btn" onClick={() => navigate(-1)}>Volver</button>
      </div>
    </div>
  );
}
