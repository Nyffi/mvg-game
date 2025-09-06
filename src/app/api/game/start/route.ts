import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Deck } from "@/lib/deck";
import type { Card } from "@/models";
import type { Counter } from "@/models/Counter";
import type { GameState } from "@/models/GameState";

const SEED = process.env.BLACKJACK_SEED;

export async function POST(req: NextRequest) {
  try {
    if (!SEED)
      return NextResponse.json({ error: "Seed não definida" }, { status: 500 });

    const { userId } = await req.json();
    if (!userId)
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );

    const client = await clientPromise;
    const db = client.db("data");

    const counter = await db
      .collection<Counter>("counters")
      .findOneAndUpdate(
        { _id: "blackjack_nonce" },
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: "after" }
      );

    const nonce = counter?.value ?? 1;

    const deck = new Deck(SEED, nonce);
    const playerInitialCard = deck.drawCard() as Card;

    const gameState: GameState = {
      roundId: randomUUID(),
      userId,
      state: "playing",
      score: playerInitialCard.numericValue,
      playerCards: [playerInitialCard],
      createdAt: new Date(),
    };

    await db.collection("games").insertOne({ ...gameState, nonce, seed: SEED });
    return NextResponse.json(gameState, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
