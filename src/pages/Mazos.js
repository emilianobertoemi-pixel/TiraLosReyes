import React from "react";
import { useNavigate } from "react-router-dom";

export default function Mazos() {
  const navigate = useNavigate();

  return (
    <div className="casio-panel">
      <h2>MAZOS</h2>

      <button className="casio-btn">Ver mazos</button>
      <button className="casio-btn">Crear mazo</button>

      <button className="casio-btn" onClick={() => navigate(-1)}>
        Volver
      </button>
    </div>
  );
}