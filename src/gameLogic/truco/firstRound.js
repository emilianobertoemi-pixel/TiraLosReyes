import { playerFromIndex } from "./helpers";
import { determineHandWinner } from "./determineHandWinner";

/*
    cardsPlayed = [
      { from: 0, card: {...} },
      { from: 1, card: {...} }
    ]
*/

export function resolveFirstRound(cardsPlayed, trucoState) {
  if (cardsPlayed.length < 2) return null;

  const c1 = cardsPlayed[0];
  const c2 = cardsPlayed[1];

  const ganador = determineHandWinner(c1.card, c2.card); // "P1" | "P2" | "Parda"

  trucoState.firstWinner = ganador;

  // === QUIÉN TIRA DESPUÉS DE LA PRIMERA RONDA ===

  if (ganador === "Parda") {
    // si es parda → tira el mano original
    trucoState.turno = trucoState.mano;
  } else {
    // si ganó alguien → ese mismo tira
    trucoState.turno = ganador;
  }

  return ganador;
}
