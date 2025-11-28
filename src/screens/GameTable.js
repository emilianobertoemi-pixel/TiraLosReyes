import React from "react";
import { useNavigate } from "react-router-dom";

export default function GameTable() {
  const navigate = useNavigate();

  const query = new URLSearchParams(window.location.search);
  const players = parseInt(query.get("players") || 2);

  // crear array de jugadores
  const playerList = Array.from({ length: players }, (_, i) => i + 1);

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        backgroundImage: "url('/assets/backgrounds/quincho-sala.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* ESPACIO PARA SEPARAR DEL BORDE SUPERIOR */}
      <div style={{ height: "6vh" }} />

      {/* ⭐ TÍTULO DEL JUEGO SOBRE LA MESA ⭐ */}
<h1
  style={{
    position: "absolute",
    top: "49%",                // 👈🔥 ANTES: 32% — AHORA BAJADO 9 CM
    left: "50%",
    transform: "translateX(-50%)",
    color: "#f4e4a1",
    fontSize: "64px",
    fontWeight: "900",
    textShadow: "3px 3px 6px rgba(0,0,0,0.7)",
    fontFamily: "'Cinzel', serif",
    letterSpacing: "4px",
    pointerEvents: "none",
  }}
>
  TIRA LOS REYES
</h1>


      {/* TÍTULO ORIGINAL (nombre de la mesa) */}
      <div className="mt-6 text-center">
        <h1 className="text-3xl text-white font-bold drop-shadow-lg">
          Mesa de Truco ({players} jugadores)
        </h1>

        <h2 className="text-lg text-white opacity-70 mt-2">
          Esperando jugadores...
        </h2>
      </div>

      {/* ESPACIO DONDE ESTÁ LA MESA (no se toca) */}
      <div style={{ height: "45vh" }} />

      {/* JUGADORES ABAJO EN LÍNEA */}
      <div className="flex gap-10 mt-4 items-center justify-center">
        {playerList.map((p) => (
          <div key={p} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-xl overflow-hidden">
              <img
                src={`https://api.dicebear.com/8.x/personas/svg?seed=p${p}`}
                alt=""
              />
            </div>

            <span className="text-white font-bold mt-2 drop-shadow-md">
              Jugador {p}
            </span>
          </div>
        ))}
      </div>

      {/* BOTONES */}
      <div className="mt-10 flex gap-4">
        <button
          className="casio-btn"
          onClick={() => navigate(`/table25d?players=${players}`)}
        >
          Iniciar partida
        </button>

        <button className="casio-btn" onClick={() => navigate(-1)}>
          Salir
        </button>
      </div>

    </div>
  );
}
