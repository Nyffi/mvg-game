import seedrandom from "seedrandom";
import type { Card } from "../models";

export class Deck {
  private seed: string;
  private nonce: number;
  private deck: Card[];

  constructor(seed: string, nonce: number) {
    this.seed = seed;
    this.nonce = nonce;
    this.deck = this.createDeck();
    this.shuffleDeck();
  }

  // Gera baralho padrão (52 cartas)
  private createDeck(): Card[] {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    const deck: Card[] = [];
    for (const suit of suits) {
      for (const value of values) {
        let numericValue: number;

        if (value === "A") {
          numericValue = 11; // Default to 11, will adjust for Aces later
        } else if (["J", "Q", "K"].includes(value)) {
          numericValue = 10;
        } else {
          numericValue = Number(value);
        }
        deck.push({ value, suit, numericValue });
      }
    }
    return deck;
  }

  // Embaralha de forma determinística
  private shuffleDeck() {
    const rng = seedrandom(`${this.seed}-${this.nonce}`);

    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // Retorna a ordem atual das cartas
  public getCards(): Card[] {
    return [...this.deck]; // cópia para evitar mutação externa
  }

  // Puxa a próxima carta do topo
  public drawCard(): Card | null {
    return this.deck.shift() || null;
  }
}
