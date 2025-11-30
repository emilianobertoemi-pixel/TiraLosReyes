// src/gameLogic/truco/turnManager.js

/*
 * winner = "P1" | "P2" | "Parda"
 * return:
 * "P1" | "P2"
 */

export function nextPlayerAfterFirstHand(winner) {
  if (winner === "P1") return "P1";
  if (winner === "P2") return "P2";
  return "P1";   // parda → sigue mano
}
