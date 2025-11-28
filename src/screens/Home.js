import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="casio-panel">
      <h2>TIRA LOS REYES</h2>
      <p className="text-lg mb-6 tracking-widest">PROTOTIPO INICIAL</p>

      <button className="casio-btn" onClick={() => navigate("/menu")}>
        INICIAR
      </button>
    </div>
  );
}