// src/gameLogic/truco/determineHandWinner.js

import { compareCards } from "./compareCards";

/*
  return:
  "P1" | "P2" | "Parda"
*/

export function determineHandWinner(cardP1, cardP2) {
  const result = compareCards(cardP1, cardP2);

  if (result === 1) return "P1";
  if (result === -1) return "P2";
  return "Parda";
}
