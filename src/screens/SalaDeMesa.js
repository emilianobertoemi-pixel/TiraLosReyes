import React from "react";
import { useNavigate } from "react-router-dom";

export default function SalaDeMesa() {
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const players = parseInt(query.get("players") || 2);

  // Texto según cantidad de jugadores
  const textoJugadores =
    players === 2
      ? "Partida de 2 jugadores"
      : players === 4
      ? "Partida de 4 jugadores"
      : players === 6
      ? "Partida de 6 jugadores"
      : `Partida de ${players} jugadores`;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-8"
      style={{
        backgroundImage: "url('/assets/backgrounds/quincho-sala.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Título arriba */}
      <div className="mt-4 text-center">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
          Tira los Reyes
        </h1>
        <p className="text-xl text-white mt-2 drop-shadow">
          Quincho del finde – {textoJugadores}
        </p>
      </div>

      {/* Mensaje central */}
      <div className="bg-black/60 text-white px-6 py-4 rounded-2xl shadow-xl">
        <p className="text-lg mb-2 font-semibold">
          Esperando a que se sienten los jugadores...
        </p>
        <p className="text-sm opacity-80">
          Cuando todos estén listos, comenzá la partida.
        </p>
      </div>

      {/* Botones abajo */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <button
          className="casio-btn"
          onClick={() => navigate(`/table?players=${players}`)}
        >
          Iniciar partida
        </button>

        <button className="casio-btn" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
}