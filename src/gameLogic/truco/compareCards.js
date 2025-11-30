// src/gameLogic/truco/compareCards.js

import { getCardPower } from "./cardPower";

export function compareCards(cardA, cardB) {
  const powerA = getCardPower(cardA);
  const powerB = getCardPower(cardB);

  if (powerA > powerB) return 1;
  if (powerA < powerB) return -1;
  return 0;
}
