// Jerarquía oficial del Truco Argentino
const cardPower = card => {
  const { rank, suit } = card;

  // Identificamos cada carta por número y palo
  const r = parseInt(rank);

  // Cartas más fuertes del juego
  if (r === 1 && suit === "espada") return 14;
  if (r === 1 && suit === "basto") return 13;
  if (r === 7 && suit === "espada") return 12;
  if (r === 7 && suit === "oro") return 11;

  // Resto de jerarquía
  switch (r) {
    case 3: return 10;
    case 2: return 9;
    case 1: return 8; // los otros doses
    case 12: return 7;
    case 11: return 6;
    case 10: return 5;
    case 7:
      // 7 falso (basto o copa)
      return 4;
    case 6: return 3;
    case 5: return 2;
    case 4: return 1;
    default: return 0;
  }
};

// Devuelve "P1", "P2" o "Parda"
export function determineHandWinner(card1, card2) {
  const p1 = cardPower(card1);
  const p2 = cardPower(card2);

  if (p1 > p2) return "P1";
  if (p2 > p1) return "P2";
  return "Parda";
}
