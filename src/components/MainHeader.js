// src/components/MainHeader.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ================== HELPERS LOCALSTORAGE ================== */
const STORAGE_USER = "tlr_user";
const STORAGE_LOGGED = "tlr_logged";

function registrarUsuario(datos) {
  localStorage.setItem(STORAGE_USER, JSON.stringify(datos));
}

function obtenerUsuario() {
  const data = localStorage.getItem(STORAGE_USER);
  return data ? JSON.parse(data) : null;
}

function loginUsuario(email) {
  localStorage.setItem(STORAGE_LOGGED, email);
}

function usuarioLogueado() {
  return localStorage.getItem(STORAGE_LOGGED);
}

function logoutUsuario() {
  localStorage.removeItem(STORAGE_LOGGED);
}

/* ====================== COMPONENTE ====================== */

export default function MainHeader() {
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const [showPerfilMenu, setShowPerfilMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);

  const fileInputRef = useRef(null);



  const profileMenuRef = useRef(null);

  const avatarList = [
    "/assets/avatars/avatar_cartoon1.png",
    "/assets/avatars/avatar_cartoon2.png",
    "/assets/avatars/avatar_cartoon3.png",
    "/assets/avatars/avatar_minimal1.png",
    "/assets/avatars/avatar_minimal2.png",
    "/assets/avatars/avatar_minimal3.png",
    "/assets/avatars/avatar_real1.png",
    "/assets/avatars/avatar_real2.png",
    "/assets/avatars/avatar_real3.png",
    "/assets/avatars/avatar_real4.png",
  ];

  /* ================== CARGAR USUARIO ================== */
  useEffect(() => {
    const email = usuarioLogueado();
    const user = obtenerUsuario();
    if (email && user && user.email === email) {
      setUsuario(user);
    }
  }, []);

  /* ================== CERRAR MENÚ AL CLIC AFUERA ================== */
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowPerfilMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================== LOGIN ================== */
  const handleLogin = () => {
    const email = document.getElementById("login_email")?.value.trim();
    const pass = document.getElementById("login_pass")?.value.trim();
    const user = obtenerUsuario();

    if (!user || user.email !== email || user.password !== pass) {
      alert("Usuario o contraseña incorrectos");
      return;
    }

    loginUsuario(email);
    setUsuario(user);
    setShowLoginModal(false);
  };

  /* ================== REGISTRO ================== */
  const handleRegister = () => {
    const nombre = document.getElementById("reg_nombre")?.value.trim();
    const email = document.getElementById("reg_email")?.value.trim();
    const pass = document.getElementById("reg_pass")?.value.trim();
    const fechaNac = document.getElementById("reg_fecha")?.value.trim();
    const dni = document.getElementById("reg_dni")?.value.trim();
    const direccion = document.getElementById("reg_dir")?.value.trim();
    const localidad = document.getElementById("reg_loc")?.value.trim();
    const nacionalidad = document.getElementById("reg_nac")?.value.trim();

    if (!nombre || !email || !pass || !fechaNac || !dni || !direccion || !localidad || !nacionalidad) {
      alert("Completá todos los campos");
      return;
    }

    const datos = {
      nombre,
      email,
      password: pass,
      fechaNac,
      dni,
      direccion,
      localidad,
      nacionalidad,
      avatar: "/assets/avatars/avatar_cartoon1.png",
    };

    registrarUsuario(datos);
    alert("Usuario registrado correctamente. Ahora podés iniciar sesión.");
    setShowRegisterModal(false);
  };

  /* ================== CAMBIAR NOMBRE (FUNCION CORRECTA) ================== */
  const handleChangeName = () => {
    const nuevoNombre = document.getElementById("nuevo_nombre_usuario")?.value.trim();
    const pass = document.getElementById("confirm_pass_nombre")?.value.trim();

    const user = obtenerUsuario();

    if (!nuevoNombre) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    if (!pass || pass !== user.password) {
      alert("La contraseña es incorrecta.");
      return;
    }

    const actualizado = { ...user, nombre: nuevoNombre };
    registrarUsuario(actualizado);
    setUsuario(actualizado);

    alert("Nombre actualizado con éxito.");
    setShowChangeNameModal(false);
  };
  const handleChangePassword = () => {
  const actual = document.getElementById("pass_actual")?.value.trim();
  const nueva = document.getElementById("pass_nueva")?.value.trim();
  const repetir = document.getElementById("pass_repetir")?.value.trim();

  const user = obtenerUsuario();

  // Validaciones
  if (!actual || actual !== user.password) {
    alert("La contraseña actual es incorrecta.");
    return;
  }

  if (!nueva || !repetir) {
    alert("Debés completar todos los campos.");
    return;
  }

  if (nueva !== repetir) {
    alert("Las contraseñas nuevas no coinciden.");
    return;
  }

  if (nueva.length < 4) {
    alert("La nueva contraseña debe tener al menos 4 caracteres.");
    return;
  }

  // Guardar nueva contraseña
  const actualizado = { ...user, password: nueva };
  registrarUsuario(actualizado);
  setUsuario(actualizado);

  alert("Contraseña actualizada con éxito.");
  setShowChangePassModal(false);
};


  /* ============== GUARDAR AVATAR AHORA FUNCIONA ================== */
  const seleccionarAvatar = (src) => {
    const user = obtenerUsuario();
    if (!user) return;

    const actualizado = { ...user, avatar: src };
    registrarUsuario(actualizado);
    setUsuario(actualizado);
    setShowAvatarModal(false);
  };
  const handleUploadAvatar = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result;

    const user = obtenerUsuario();
    if (!user) return;

    // Guardar en el usuario
    const actualizado = { ...user, avatar: base64 };
    registrarUsuario(actualizado);
    setUsuario(actualizado);

    setShowAvatarModal(false);
  };

  reader.readAsDataURL(file); // convierte la imagen a base64
};


  /* ======================= RENDER ======================= */

  return (
    <>
      {/* ===================== HEADER ===================== */}
      <header className="absolute top-0 left-0 w-full h-16 bg-black/40 backdrop-blur-md flex items-center justify-between px-10 z-20">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/assets/logo/tlr-logo.png" alt="logo" className="w-12 h-12" />
            <span className="text-white text-2xl font-bold">TIRA LOS REYES</span>
          </div>

          {usuario && (
            <>
              <img src={usuario.avatar} className="w-10 h-10 rounded-full border border-white shadow" />

              <span className="text-white text-lg font-semibold">{usuario.nombre}</span>

              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowPerfilMenu(!showPerfilMenu)}
                  className="flex items-center gap-1 text-white hover:text-yellow-300 text-lg"
                >
                  Mi Perfil
                  <svg className={`w-4 h-4 transition-transform ${showPerfilMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showPerfilMenu && (
                  <div className="absolute left-0 mt-2 bg-black/90 p-4 rounded-lg shadow-xl text-white text-lg flex flex-col gap-2 min-w-[200px] border border-white/10 animate-fadeIn z-50">
                    <button onClick={() => setShowChangeNameModal(true)} className="hover:text-yellow-300 text-left">
                      Cambiar nombre de usuario
                    </button>
                    <button
  className="hover:text-yellow-300 text-left"
  onClick={() => setShowChangePassModal(true)}
>
  Cambiar contraseña
</button>

                    <button onClick={() => setShowAvatarModal(true)} className="hover:text-yellow-300 text-left">
                      Cambiar foto de perfil
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* DERECHA */}
        <nav className="flex items-center gap-8 text-white text-lg">
          {!usuario && (
            <>
              <button onClick={() => navigate("/")}>Inicio</button>
              <button onClick={() => setShowRegisterModal(true)}>Registrarse</button>
              <button onClick={() => setShowLoginModal(true)}>Iniciar Sesión</button>
              <button>Ayuda</button>
              <button>Contacto</button>
            </>
          )}

          {usuario && (
            <>
              <button onClick={() => navigate("/ajustes")} className="hover:text-yellow-300">Ajustes</button>
              <button onClick={() => navigate("/ayuda")} className="hover:text-yellow-300">Ayuda</button>
              <button onClick={() => navigate("/contacto")} className="hover:text-yellow-300">Contacto</button>
              <button onClick={() => { logoutUsuario(); setUsuario(null); }} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-white">
                Cerrar Sesión
              </button>
            </>
          )}
        </nav>
      </header>

      {/* ===================== MODAL CHANGE NAME ===================== */}
      {showChangeNameModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[420px] relative">
            <button onClick={() => setShowChangeNameModal(false)} className="absolute top-3 right-3 text-xl">✖</button>

            <h2 className="text-2xl font-bold text-center mb-6">Cambiar nombre de usuario</h2>

            <input id="nuevo_nombre_usuario" placeholder="Nuevo nombre" className="w-full border p-3 rounded mb-4" />
            <input id="confirm_pass_nombre" type="password" placeholder="Confirmar contraseña" className="w-full border p-3 rounded mb-4" />

            <button onClick={handleChangeName} className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700">
              Guardar Cambios
            </button>
          </div>
        </div>
      )}
      {/* ===================== MODAL CAMBIAR CONTRASEÑA ===================== */}
{showChangePassModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-[420px] relative">

      <button
        onClick={() => setShowChangePassModal(false)}
        className="absolute top-3 right-3 text-xl"
      >
        ✖
      </button>

      <h2 className="text-2xl font-bold text-center mb-6">
        Cambiar contraseña
      </h2>

      <input
        id="pass_actual"
        type="password"
        placeholder="Contraseña actual"
        className="w-full border p-3 rounded mb-4"
      />

      <input
        id="pass_nueva"
        type="password"
        placeholder="Nueva contraseña"
        className="w-full border p-3 rounded mb-4"
      />

      <input
        id="pass_repetir"
        type="password"
        placeholder="Repetir nueva contraseña"
        className="w-full border p-3 rounded mb-4"
      />

      <button
        onClick={handleChangePassword}
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
      >
        Guardar Cambios
      </button>

    </div>
  </div>
)}


      {/* ===================== MODAL AVATARES ===================== */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[600px] relative">
            <button onClick={() => setShowAvatarModal(false)} className="absolute top-3 right-3 text-xl">✖</button>
            <h2 className="text-2xl font-bold text-center mb-4">Elegí tu nuevo avatar</h2>

            <div className="grid grid-cols-5 gap-4">
              {avatarList.map((src, i) => (
                <img key={i} src={src} className="cursor-pointer w-20 h-20 rounded-full border hover:border-yellow-400" onClick={() => seleccionarAvatar(src)} />
              ))}
            </div>
            {/* --- OPCIÓN DE SUBIR AVATAR DESDE LA PC --- */}
<div
  className="cursor-pointer w-20 h-20 rounded-full border-2 border-dashed border-gray-400 
             flex items-center justify-center text-3xl text-gray-500 hover:border-yellow-400
             hover:text-yellow-400 transition"
  onClick={() => fileInputRef.current.click()}
>
  +
</div>

{/* input realmente oculto */}
<input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  className="hidden"
  onChange={handleUploadAvatar}
/>

          </div>
        </div>
      )}

      {/* ===================== MODAL LOGIN ===================== */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[380px] relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-3 right-3 text-xl">✖</button>
            <h2 className="text-2xl font-bold text-center mb-4">Iniciar Sesión</h2>

            <input id="login_email" type="email" placeholder="Email" className="w-full border p-3 rounded mb-3" />
            <input id="login_pass" type="password" placeholder="Contraseña" className="w-full border p-3 rounded mb-4" />

            <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-3 rounded mb-3 hover:bg-blue-700">Ingresar</button>
          </div>
        </div>
      )}

      {/* ===================== MODAL REGISTRO ===================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[420px] relative">
            <button onClick={() => setShowRegisterModal(false)} className="absolute top-3 right-3 text-xl">✖</button>

            <h2 className="text-2xl font-bold text-center mb-4">Crear Cuenta</h2>

            <input id="reg_nombre" placeholder="Nombre Completo" className="w-full border p-3 rounded mb-3" />
            <input id="reg_email" type="email" placeholder="Email" className="w-full border p-3 rounded mb-3" />
            <input id="reg_pass" type="password" placeholder="Contraseña" className="w-full border p-3 rounded mb-3" />

            <input id="reg_fecha" type="date" className="w-full border p-3 rounded mb-3" />
            <input id="reg_dni" placeholder="DNI" className="w-full border p-3 rounded mb-3" />
            <input id="reg_dir" placeholder="Dirección" className="w-full border p-3 rounded mb-3" />
            <input id="reg_loc" placeholder="Localidad" className="w-full border p-3 rounded mb-3" />
            <input id="reg_nac" placeholder="Nacionalidad" className="w-full border p-3 rounded mb-4" />

            <button onClick={handleRegister} className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700">Crear Cuenta</button>
          </div>
        </div>
      )}
    </>
  );
}
