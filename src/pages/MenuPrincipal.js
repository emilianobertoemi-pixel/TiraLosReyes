import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";   // ← IMPORTA EL HEADER CORRECTO

export default function MenuPrincipal() {
  const navigate = useNavigate();
  const [showSubmenu, setShowSubmenu] = useState(false);

  // === AUDIO ===
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2; // volumen suave
      audioRef.current.play().catch(() => {
        // Chrome puede bloquear autoplay hasta el primer click
      });
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* === AUDIO DE FONDO === */}
      <audio
        ref={audioRef}
        src="/assets/audio/menu-theme.mp3"
        loop
      />

      
      {/* === HEADER === */}
      <MainHeader />
      {/* === BOTÓN DE SONIDO === */}
<div className="absolute top-20 left-5 z-50">
  <button
    onClick={() => {
      setMuted(!muted);
      if (audioRef.current) audioRef.current.muted = !muted;
    }}
    className="bg-black/60 text-white px-4 py-2 rounded-lg text-2xl 
               hover:bg-black/80 transition shadow-lg"
  >
    {muted ? "🔇" : "🔊"}
  </button>
</div>



      {/* === FONDO === */}
      <img
        src="/fondo-menu.jpg"
        alt="fondo"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* === CONTENEDOR DEL MENÚ PRINCIPAL === */}
      <div className="absolute top-24 right-8 z-10">
        <div className="bg-[#f3e0c7] bg-opacity-95 border-4 border-[#5e3d21] rounded-2xl shadow-2xl p-6 w-80">

          <h1 className="text-3xl font-bold text-[#4a2e0a] text-center mb-6">
            Menú Principal
          </h1>

          {/* === MENÚ PRINCIPAL === */}
          {!showSubmenu && (
            <div className="flex flex-col gap-4">

              <button
                onClick={() => setShowSubmenu(true)}
                className="bg-[#6b4a2b] text-[#fcecc2] py-3 rounded-xl text-xl font-semibold
                           border border-[#3e2714] shadow-[0_4px_6px_rgba(0,0,0,0.4)]
                           hover:bg-[#835b34] hover:scale-105 transition-transform duration-150"
              >
                Jugar
              </button>

              <button
                onClick={() => navigate("/mazos")}
                className="bg-[#6b4a2b] text-[#fcecc2] py-3 rounded-xl text-xl font-semibold
                           border border-[#3e2714] shadow-[0_4px_6px_rgba(0,0,0,0.4)]
                           hover:bg-[#835b34] hover:scale-105 transition-transform duration-150"
              >
                Personalizar Mazos
              </button>

              <button
                onClick={() => navigate("/ajustes")}
                className="bg-[#6b4a2b] text-[#fcecc2] py-3 rounded-xl text-xl font-semibold
                           border border-[#3e2714] shadow-[0_4px_6px_rgba(0,0,0,0.4)]
                           hover:bg-[#835b34] hover:scale-105 transition-transform duration-150"
              >
                Ajustes
              </button>

              <button
                className="bg-[#a63e3e] text-[#fcecc2] py-3 rounded-xl text-xl font-semibold
                           border border-[#632020] shadow-[0_4px_6px_rgba(0,0,0,0.4)]
                           hover:bg-[#c45151] hover:scale-105 transition-transform duration-150"
              >
                Salir
              </button>

            </div>
          )}

          {/* === SUBMENÚ === */}
          {showSubmenu && (
            <div className="flex flex-col gap-4 animate-card">

              <button
                onClick={() => navigate("/table?players=2")}
                className="bg-[#4a2e0a] text-[#fcecc2] py-3 rounded-xl text-xl font-semibold
                           border border-[#2a1807] shadow-[0_4px_6px_rgba(0,0,0,0.4)]
                           hover:bg-[#61401b] hover:scale-105 transition-transform duration-150"
              >
                Mesa de 2 jugadores
              </button>

              <button
                onClick={() => navigate("/table?players=4")}
                className="bg-[#4a2e0a] text-[#fcecc2] py-3 rounded-xl text-xl font-semibold
                           border border-[#2a1807] shadow-[0_4px_6px_rgba(0,0,0,0.4)]
                           hover:bg-[#61401b] hover:scale-105 transition-transform duration-150"
              >
                Mesa de 4 jugadores
              </button>

              <button
                onClick={() => navigate("/table?players=6")}
                className="bg-[#4a2e0a] text-[#fcecc2] py-3 rounded-xl text-xl font-semibold
                           border border-[#2a1807] shadow-[0_4px_6px_rgba(0,0,0,0.4)]
                           hover:bg-[#61401b] hover:scale-105 transition-transform duration-150"
              >
                Mesa de 6 jugadores
              </button>

              <button
                onClick={() => setShowSubmenu(false)}
                className="bg-[#a63e3e] text-[#fcecc2] py-3 rounded-xl text-xl font-semibold
                           border border-[#632020] shadow-[0_4px_6px_rgba(0,0,0,0.4)]
                           hover:bg-[#c45151] hover:scale-105 transition-transform duration-150"
              >
                Volver
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
