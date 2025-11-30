// src/gameLogic/truco/determineRoundWinner.js

/*
 * trickWinners = ["P1", "P2", "Parda"]
 */

export function determineRoundWinner(trickWinners) {
  const [first, second, third] = trickWinners;

  // Si alguien gana la 1ra y la 2da → ronda definida
  if (first === "P1" && second === "P1") return "P1";
  if (first === "P2" && second === "P2") return "P2";

  // 1ra parda → segunda define
  if (first === "Parda") {
    if (second === "P1") return "P1";
    if (second === "P2") return "P2";

    // doble parda → define 3ra
    if (third === "P1") return "P1";
    if (third === "P2") return "P2";

    // triple parda → gana mano (P1)
    return "P1";
  }

  // 2da parda → gana quien ganó la 1ra
  if (second === "Parda") return first;

  // tercera define si viene 1-1
  if (third === "P1") return "P1";
  if (third === "P2") return "P2";

  // parda en 3ra → gana quien ganó la 1ra
  if (third === "Parda") return first;

  return null;
}
