// src/utils/getCardPower.js

export function getCardPower(card) {
  // ejemplo, tu versión puede ser distinta
  const powers = {
    "1 espada": 14,
    "1 basto": 13,
    "7 espada": 12,
    "7 oro": 11,
    // ... resto de cartas
  };

  const key = `${card.rank} ${card.suit}`;
  return powers[key] || 1;
}