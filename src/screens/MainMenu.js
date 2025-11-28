import React from "react";
import { useNavigate } from "react-router-dom";

export default function MenuPrincipal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7eacb] flex flex-col items-center justify-center text-center">

      <h1 className="text-5xl font-bold text-[#4a2e0a] drop-shadow-lg mb-10">
        Menú Principal
      </h1>

      <div className="flex flex-col gap-6 w-64">

        <button
          onClick={() => navigate("/select-room")}
          className="bg-[#4a2e0a] text-white py-3 rounded-xl text-xl hover:bg-[#6b4210] transition"
        >
          Jugar
        </button>

        <button
          onClick={() => navigate("/mazos")}
          className="bg-[#4a2e0a] text-white py-3 rounded-xl text-xl hover:bg-[#6b4210] transition"
        >
          Personalizar Mazos
        </button>

        <button
          onClick={() => navigate("/ajustes")}
          className="bg-[#4a2e0a] text-white py-3 rounded-xl text-xl hover:bg-[#6b4210] transition"
        >
          Ajustes
        </button>

        <button className="bg-[#a63e3e] text-white py-3 rounded-xl text-xl hover:bg-[#c45151] transition">
          Salir
        </button>

      </div>
    </div>
  );
}