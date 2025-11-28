import React from "react";
import { useNavigate } from "react-router-dom";

export default function MenuPrincipal() {
  const navigate = useNavigate();

  return (
    <div className="casio-panel">
      <h2>MENU PRINCIPAL</h2>

      <button className="casio-btn" onClick={() => navigate("/select-room")}>
        Jugar
      </button>

      <button className="casio-btn" onClick={() => navigate("/mazos")}>
        Mazos
      </button>

      <button className="casio-btn" onClick={() => navigate("/ajustes")}>
        Ajustes
      </button>

      <button className="casio-btn" onClick={() => navigate("/")}>
        Salir
      </button>
    </div>
  );
}