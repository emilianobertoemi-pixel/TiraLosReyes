import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import ScoreBoard from "../components/ScoreBoard";
import "./table2d.css";

export default function GameTable2D() {
  const navigate = useNavigate();

  // leer cantidad de jugadores
  const query = new URLSearchParams(window.location.search);
  const players = parseInt(query.get("players") || 2);

  // manos por jugador
  const [hands, setHands] = useState(
    Array.from({ length: players }, () => [])
  );

  // cartas en el centro
  const [tableCards, setTableCards] = useState([]);

  // mazo simple (despues lo reemplazamos por uno real)
  const deckRanks = ["1","2","3","4","5","6","7","10","11","12"];
  const deckSuits = ["♥","♦","♣","♠"];

  const generateDeck = () => {
    let id = 1;
    const deck = [];
    for (const r of deckRanks) {
      for (const s of deckSuits) {
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

  // jugar carta
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
      className="table2d-container"
      style={{
        backgroundImage: "url('/assets/backgrounds/tapete-mesa.jpg')",
      }}
    >
      <h1 className="game-title">Mesa de Truco ({players} jugadores)</h1>

      {/* TAPETE / ÁREA DE JUEGO */}
      <div className="tapete-area">

        {/* Cartas jugadas en el centro */}
        <div className="center-cards">
          {tableCards.map((c, i) => (
            <Card
              key={c.id + "-" + i}
              rank={c.rank}
              faceUp={true}
              style={{
                position: "absolute",
                left: `${i * 40}px`,
                top: `${i * 10}px`,
                zIndex: 10 + i,
              }}
            />
          ))}
        </div>

      </div>

      {/* MANO DEL JUGADOR (abajo centrado) */}
      <div className="player-hand">
        {hands[0] &&
          hands[0].map((card, i) => (
            <Card
              key={card.id}
              rank={card.rank}
              faceUp={true}
              onClick={() => playCard(0, i)}
              style={{
                transform: `rotate(${(i - 1) * 10}deg)`,
                zIndex: 50 + i,
              }}
            />
          ))}
      </div>

      {/* MENU DERECHO (para truco, envido, flor) */}
      <div className="side-menu">
        <button className="action-btn">Truco</button>
        <button className="action-btn">Envido</button>
        <button className="action-btn">Real Envido</button>
        <button className="action-btn">Falta Envido</button>
        <button className="action-btn">Flor</button>
      </div>

      {/* CONTROLES ABAJO */}
      <div className="controls">
        <button className="casio-btn" onClick={deal}>Repartir</button>
        <button className="casio-btn" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
}
