// src/gameLogic/truco/evaluateHand.js

// Fuerza según jerarquía real del Truco
// Valor más alto = carta más fuerte
export const getCardStrength = (card) => {
  if (!card) return 0;
  const { rank, suit } = card;

  // 1° 1 de espada
  if (rank === 1 && suit === "espada") return 14;
  // 2° 1 de basto
  if (rank === 1 && suit === "basto") return 13;
  // 3° 7 de espada
  if (rank === 7 && suit === "espada") return 12;
  // 4° 7 de oro
  if (rank === 7 && suit === "oro") return 11;
  // 5° todos los 3
  if (rank === 3) return 10;
  // 6° todos los 2
  if (rank === 2) return 9;
  // 7° 1 de oro / 1 de copa
  if (rank === 1) return 8;
  // 8° todos los 12
  if (rank === 12) return 7;
  // 9° todos los 11
  if (rank === 11) return 6;
  // 10° todos los 10
  if (rank === 10) return 5;
  // 11° 7 falsos (copa / basto)
  if (rank === 7) return 4;
  // 12° 6
  if (rank === 6) return 3;
  // 13° 5
  if (rank === 5) return 2;
  // 14° 4
  if (rank === 4) return 1;

  return 0;
};

export const evaluateHand = (hand = []) => {
  if (!hand || hand.length === 0) {
    return {
      level: "vacia",
      best: 0,
      strengths: [],
      sumTop2: 0,
    };
  }

  const strengths = hand.map(getCardStrength).sort((a, b) => b - a);
  const best = strengths[0] || 0;
  const sumTop2 = (strengths[0] || 0) + (strengths[1] || 0);

  let level = "baja";

  if (best >= 13 || sumTop2 >= 23) {
    // ej: 1 espada, 1 basto, 7 espada, 7 oro, etc
    level = "muy_fuerte";
  } else if (best >= 10 || sumTop2 >= 18) {
    // ej: 3 buenos, 2+3, 3+1, etc
    level = "fuerte";
  } else if (best >= 7) {
    level = "media";
  }

  return { level, best, strengths, sumTop2 };
};
