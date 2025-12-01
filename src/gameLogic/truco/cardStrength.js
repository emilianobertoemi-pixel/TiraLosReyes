// FUERZA DE CARTAS EN EL TRUCO ARGENTINO
// (de mayor a menor)

const valoresTruco = {
  "1-espada": 14,
  "1-basto": 13,
  "7-espada": 12,
  "7-oro": 11,
  "3": 10,
  "2": 9,
  "1": 8,
  "12": 7, // rey
  "11": 6, // caballo
  "10": 5, // sota
  "7": 4,
  "6": 3,
  "5": 2,
  "4": 1
};

// Devuelve la fuerza (power) de una carta
export function getCardStrength(card) {
  const key = `${card.numero}-${card.palo}`;

  if (valoresTruco[key]) {
    return valoresTruco[key];
  }

  // casilleros que NO dependen del palo (3, 2, 1, 12, 11, 10, 7, 6, 5, 4)
  if (valoresTruco[card.numero]) {
    return valoresTruco[card.numero];
  }

  console.warn("Carta desconocida en fuerza truco:", card);
  return 0;
}

// Devuelve la fuerza de la MANO completa sumando o eligiendo mejores
export function evaluateHandStrength(hand) {
  // Estrategia simple: sumar las 2 mejores cartas
  const strengths = hand.map(getCardStrength);
  strengths.sort((a, b) => b - a);

  return strengths[0] + strengths[1]; // mejores 2 cartas
}
