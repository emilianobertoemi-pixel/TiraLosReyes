import React from "react";
import { useNavigate } from "react-router-dom";

export default function Ajustes() {
  const navigate = useNavigate();

  return (
    <div className="casio-panel">
      <h2>AJUSTES</h2>

      <button className="casio-btn">Audio</button>
      <button className="casio-btn">Idioma</button>
      <button className="casio-btn">Controles</button>

      <button className="casio-btn" onClick={() => navigate(-1)}>
        Volver
      </button>
    </div>
  );
}