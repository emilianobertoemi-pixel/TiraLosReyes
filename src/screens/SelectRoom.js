import React from "react";
import { useNavigate } from "react-router-dom";

export default function SelectRoom() {
  const navigate = useNavigate();

  return (
    <div className="casio-panel">
      <h2>SELECCIONAR MESA</h2>

      <button
        className="casio-btn"
        onClick={() => navigate("/create-room?players=2")}
      >
        Mesa de 2 jugadores
      </button>

      <button
        className="casio-btn"
        onClick={() => navigate("/create-room?players=4")}
      >
        Mesa de 4 jugadores
      </button>

      <button
        className="casio-btn"
        onClick={() => navigate("/create-room?players=6")}
      >
        Mesa de 6 jugadores
      </button>

      <button className="casio-btn" onClick={() => navigate(-1)}>
        VOLVER
      </button>
    </div>
  );
}