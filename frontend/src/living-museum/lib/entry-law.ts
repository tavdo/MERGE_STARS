// Latest founder instruction. Display only; payable amounts require CORE quotes.
export const entryLineRequirements = Object.freeze([
  Object.freeze({ line: "SILVER", minimum_coins: 1, label: "Silver Line", basis: "2 კგ ვერცხლის LIVE ღირებულების საფუძველი" }),
  Object.freeze({ line: "GOLD", minimum_coins: 1, label: "Gold Line", basis: "1 კგ ოქროს LIVE ღირებულების საფუძველი" }),
] as const);
