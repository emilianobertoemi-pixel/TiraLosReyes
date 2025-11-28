import React, { useState } from "react";
import "./scoreboard.css";

export default function ScoreBoard() {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);

  // Generador de palitos modernos
  const renderSticks = (value) => {
    if (value === 0) return "–";

    const fullGroups = Math.floor(value / 5);
    const remainder = value % 5;

    let sticks = [];

    // Cada grupo de 5 → símbolo moderno "+"
    for (let g = 0; g < fullGroups; g++) sticks.push("+");

    // Resto de palitos 1..4
    sticks.push("|".repeat(remainder));

    return sticks.join(" ");
  };

  return (
    <div className="scoreboard-panel">
      <h3 className="score-title">Marcador</h3>

      {/* Jugador 1 */}
      <div className="score-row">
        <span className="score-name">Jugador 1</span>
        <span className="score-sticks">{renderSticks(p1)}</span>
        <button className="score-btn" onClick={() => setP1(p1 + 1)}>+</button>
      </div>

      {/* Jugador 2 */}
      <div className="score-row">
        <span className="score-name">Jugador 2</span>
        <span className="score-sticks">{renderSticks(p2)}</span>
        <button className="score-btn" onClick={() => setP2(p2 + 1)}>+</button>
      </div>
    </div>
  );
}