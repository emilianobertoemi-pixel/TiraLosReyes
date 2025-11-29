// =========================
//   IMPORTAR ESPADAS
// =========================
import espada_1 from "../assets/cards/espadas/espada_1.jpg";
import espada_2 from "../assets/cards/espadas/espada_2.jpg";
import espada_3 from "../assets/cards/espadas/espada_3.jpg";
import espada_4 from "../assets/cards/espadas/espada_4.jpg";
import espada_5 from "../assets/cards/espadas/espada_5.jpg";
import espada_6 from "../assets/cards/espadas/espada_6.jpg";
import espada_7 from "../assets/cards/espadas/espada_7.jpg";
import espada_10 from "../assets/cards/espadas/espada_10.jpg";
import espada_11 from "../assets/cards/espadas/espada_11.jpg";
import espada_12 from "../assets/cards/espadas/espada_12.jpg";

// =========================
//   IMPORTAR OROS
// =========================
import oro_1 from "../assets/cards/oros/oro_1.jpg";
import oro_2 from "../assets/cards/oros/oro_2.jpg";
import oro_3 from "../assets/cards/oros/oro_3.jpg";
import oro_4 from "../assets/cards/oros/oro_4.jpg";
import oro_5 from "../assets/cards/oros/oro_5.jpg";
import oro_6 from "../assets/cards/oros/oro_6.jpg";
import oro_7 from "../assets/cards/oros/oro_7.jpg";
import oro_10 from "../assets/cards/oros/oro_10.jpg";
import oro_11 from "../assets/cards/oros/oro_11.jpg";
import oro_12 from "../assets/cards/oros/oro_12.jpg";

// =========================
//   IMPORTAR COPAS
// =========================
import copa_1 from "../assets/cards/copas/copa_1.jpg";
import copa_2 from "../assets/cards/copas/copa_2.jpg";
import copa_3 from "../assets/cards/copas/copa_3.jpg";
import copa_4 from "../assets/cards/copas/copa_4.jpg";
import copa_5 from "../assets/cards/copas/copa_5.jpg";
import copa_6 from "../assets/cards/copas/copa_6.jpg";
import copa_7 from "../assets/cards/copas/copa_7.jpg";
import copa_10 from "../assets/cards/copas/copa_10.jpg";
import copa_11 from "../assets/cards/copas/copa_11.jpg";
import copa_12 from "../assets/cards/copas/copa_12.jpg";

// =========================
//   IMPORTAR BASTOS
// =========================
import basto_1 from "../assets/cards/bastos/basto_1.jpg";
import basto_2 from "../assets/cards/bastos/basto_2.jpg";
import basto_3 from "../assets/cards/bastos/basto_3.jpg";
import basto_4 from "../assets/cards/bastos/basto_4.jpg";
import basto_5 from "../assets/cards/bastos/basto_5.jpg";
import basto_6 from "../assets/cards/bastos/basto_6.jpg";
import basto_7 from "../assets/cards/bastos/basto_7.jpg";
import basto_10 from "../assets/cards/bastos/basto_10.jpg";
import basto_11 from "../assets/cards/bastos/basto_11.jpg";
import basto_12 from "../assets/cards/bastos/basto_12.jpg";


// =======================================
//     FUNCIÓN PARA GENERAR EL MAZO
// =======================================
export const generateDeck = () => {
  return [
    // ESPADAS
    { id: "e1", rank: 1, suit: "espada", img: espada_1 },
    { id: "e2", rank: 2, suit: "espada", img: espada_2 },
    { id: "e3", rank: 3, suit: "espada", img: espada_3 },
    { id: "e4", rank: 4, suit: "espada", img: espada_4 },
    { id: "e5", rank: 5, suit: "espada", img: espada_5 },
    { id: "e6", rank: 6, suit: "espada", img: espada_6 },
    { id: "e7", rank: 7, suit: "espada", img: espada_7 },
    { id: "e10", rank: 10, suit: "espada", img: espada_10 },
    { id: "e11", rank: 11, suit: "espada", img: espada_11 },
    { id: "e12", rank: 12, suit: "espada", img: espada_12 },

    // OROS
    { id: "o1", rank: 1, suit: "oro", img: oro_1 },
    { id: "o2", rank: 2, suit: "oro", img: oro_2 },
    { id: "o3", rank: 3, suit: "oro", img: oro_3 },
    { id: "o4", rank: 4, suit: "oro", img: oro_4 },
    { id: "o5", rank: 5, suit: "oro", img: oro_5 },
    { id: "o6", rank: 6, suit: "oro", img: oro_6 },
    { id: "o7", rank: 7, suit: "oro", img: oro_7 },
    { id: "o10", rank: 10, suit: "oro", img: oro_10 },
    { id: "o11", rank: 11, suit: "oro", img: oro_11 },
    { id: "o12", rank: 12, suit: "oro", img: oro_12 },

    // COPAS
    { id: "c1", rank: 1, suit: "copa", img: copa_1 },
    { id: "c2", rank: 2, suit: "copa", img: copa_2 },
    { id: "c3", rank: 3, suit: "copa", img: copa_3 },
    { id: "c4", rank: 4, suit: "copa", img: copa_4 },
    { id: "c5", rank: 5, suit: "copa", img: copa_5 },
    { id: "c6", rank: 6, suit: "copa", img: copa_6 },
    { id: "c7", rank: 7, suit: "copa", img: copa_7 },
    { id: "c10", rank: 10, suit: "copa", img: copa_10 },
    { id: "c11", rank: 11, suit: "copa", img: copa_11 },
    { id: "c12", rank: 12, suit: "copa", img: copa_12 },

    // BASTOS
    { id: "b1", rank: 1, suit: "basto", img: basto_1 },
    { id: "b2", rank: 2, suit: "basto", img: basto_2 },
    { id: "b3", rank: 3, suit: "basto", img: basto_3 },
    { id: "b4", rank: 4, suit: "basto", img: basto_4 },
    { id: "b5", rank: 5, suit: "basto", img: basto_5 },
    { id: "b6", rank: 6, suit: "basto", img: basto_6 },
    { id: "b7", rank: 7, suit: "basto", img: basto_7 },
    { id: "b10", rank: 10, suit: "basto", img: basto_10 },
    { id: "b11", rank: 11, suit: "basto", img: basto_11 },
    { id: "b12", rank: 12, suit: "basto", img: basto_12 },
  ];
};

// =========================
//   SHUFFLE (mezclar)
// =========================
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
