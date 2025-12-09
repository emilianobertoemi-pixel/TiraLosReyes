// src/audio/soundManager.js

// Rutas a los sonidos
const sounds = {
  card: new Audio("/assets/audio/fx/card.mp3"),
  deal: new Audio("/assets/audio/fx/deal.mp3"),
  truco: new Audio("/assets/audio/fx/truco.mp3"),
};

// Volumen recomendado
sounds.card.volume = 0.45;
sounds.deal.volume = 0.35;
sounds.truco.volume = 0.6;

// Funciones públicas
export const playCardSound = () => {
  sounds.card.currentTime = 0;
  sounds.card.play().catch(() => {});
};

export const playDealSound = () => {
  sounds.deal.currentTime = 0;
  sounds.deal.play().catch(() => {});
};

export const playTrucoSound = () => {
  sounds.truco.currentTime = 0;
  sounds.truco.play().catch(() => {});
};
