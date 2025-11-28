import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoomCreate() {
  const navigate = useNavigate();

  const query = new URLSearchParams(window.location.search);
  const players = query.get("players") || 2;

  return (
    <div className="casio-panel">
      <h2>CREAR MESA</h2>

      <p className="mb-4 text-lg tracking-wider">
        Jugadores: <strong>{players}</strong>
      </p>

      {/* 🔥 Corrección importante: ir a la sala de espera del quincho */}
      <button
        className="casio-btn"
        onClick={() => navigate(`/table?players=${players}`)}
      >
        CREAR MESA
      </button>

      <button className="casio-btn" onClick={() => navigate(-1)}>
        VOLVER
      </button>
    </div>
  );
}
