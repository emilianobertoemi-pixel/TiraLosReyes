// src/utils/compareCards.js
import { getCardPower } from "./getCardPower";

export function compareCards(cardA, cardB) {
  const powerA = getCardPower(cardA);
  const powerB = getCardPower(cardB);

  if (powerA > powerB) return 1;   // gana A
  if (powerA < powerB) return -1;  // gana B
  return 0;                        // parda
}