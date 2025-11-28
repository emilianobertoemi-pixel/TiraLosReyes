import React, { useState } from "react";
import "./AnotadorTruco.css";

export default function AnotadorTruco() {

  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);

  const sumar = (p, setP) => {
    let t = p + 1;
    if (t === 30) {
      alert("¡Ganaste la partida!");
      t = 30;
    }
    setP(t);
  };

  const restar = (p, setP) => {
    let t = p - 1;
    if (t < 0) t = 0;
    setP(t);
  };

  const drawCube = (count) => {
    if (count === 0) return <div className="matches empty" />;

    return (
      <div className="matches">
        {count >= 1 && <div className="match-horizontal-top" />}
        {count >= 2 && <div className="match-vertical-right" />}
        {count >= 3 && <div className="match-horizontal-bottom" />}
        {count >= 4 && <div className="match-vertical-left" />}
        {count === 5 && <div className="match-diagonal" />}
      </div>
    );
  };

  const getCubos = (points) => {
    const malas = Math.min(points, 15);
    const buenas = Math.max(points - 15, 0);

    const cubosMalas = [
      Math.min(malas, 5),
      Math.min(Math.max(malas - 5, 0), 5),
      Math.min(Math.max(malas - 10, 0), 5),
    ];

    const cubosBuenas = [
      Math.min(buenas, 5),
      Math.min(Math.max(buenas - 5, 0), 5),
      Math.min(Math.max(buenas - 10, 0), 5),
    ];

    return { cubosMalas, cubosBuenas };
  };

  const p1C = getCubos(p1);
  const p2C = getCubos(p2);

  return (
    <>
      <div className="anotador-wrapper">

        {/* PANEL */}
        <div className="anotador-panel">

          <div className="anotador-header">
            <div className="header-cell">JUGADOR 1</div>
            <div className="header-cell">JUGADOR 2</div>
          </div>

          <div className="anotador-band-row">
            <div className="band-label">MALAS</div>
            <div className="band-label">MALAS</div>
          </div>

          <div className="anotador-cubes-row">
            <div className="cubes-column">
              {p1C.cubosMalas.map((n, i) => (
                <div className="cube-slot" key={i}>{drawCube(n)}</div>
              ))}
            </div>

            <div className="cubes-column">
              {p2C.cubosMalas.map((n, i) => (
                <div className="cube-slot" key={i}>{drawCube(n)}</div>
              ))}
            </div>
          </div>

          <div className="anotador-band-row">
            <div className="band-label">BUENAS</div>
            <div className="band-label">BUENAS</div>
          </div>

          <div className="anotador-cubes-row">
            <div className="cubes-column">
              {p1C.cubosBuenas.map((n, i) => (
                <div className="cube-slot" key={i}>{drawCube(n)}</div>
              ))}
            </div>

            <div className="cubes-column">
              {p2C.cubosBuenas.map((n, i) => (
                <div className="cube-slot" key={i}>{drawCube(n)}</div>
              ))}
            </div>
          </div>

        </div>

        {/* BOTONES ABAJO DEL PANEL */}
        <div className="score-controls-container">

          <div className="score-row">
            <button className="score-btn-small" onClick={() => sumar(p1, setP1)}>+ Puntos</button>
            <button className="score-btn-small" onClick={() => restar(p1, setP1)}>-</button>
          </div>

          <div className="score-row">
            <button className="score-btn-small" onClick={() => sumar(p2, setP2)}>+ Puntos</button>
            <button className="score-btn-small" onClick={() => restar(p2, setP2)}>-</button>
          </div>

        </div>

      </div>
    </>
  );
}
