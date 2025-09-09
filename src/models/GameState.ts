import type { Card } from "./Card";

export type GameState = {
  roundId: string;
  userId: string;
  state: GameProgress;
  score: number;
  playerCards: Card[];
  tknEarned?: number;
  createdAt: Date;
};

export type GameProgress = "playing" | "bust" | "finished";
