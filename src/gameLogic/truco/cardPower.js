// src/gameLogic/truco/cardPower.js

export function getCardPower(card) {
  const id = card.id;

  // Matas
  if (id === "e1") return 14;
  if (id === "b1") return 13;
  if (id === "e7") return 12;
  if (id === "o7") return 11;

  // 3 y 2
  if (card.rank === 3) return 10;
  if (card.rank === 2) return 9;

  // 1 de oro y 1 de copa
  if (id === "o1" || id === "c1") return 8;

  // 12, 11, 10
  if (card.rank === 12) return 7;
  if (card.rank === 11) return 6;
  if (card.rank === 10) return 5;

  // 7 de copa y 7 de basto
  if (id === "c7" || id === "b7") return 4;

  // 6, 5, 4
  if (card.rank === 6) return 3;
  if (card.rank === 5) return 2;
  if (card.rank === 4) return 1;

  return 0;
}
