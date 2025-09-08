import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();
    const client = await clientPromise;
    const session = client.startSession();

    let success = false;

    await session.withTransaction(async () => {
      const users = client.db("data").collection("users");
      const transactions = client.db("data").collection("transactions");

      // 1. Credita os pontos
      await users.updateOne(
        { _id: userId },
        { $inc: { points: amount } },
        { session }
      );

      // 2. Log da transação
      await transactions.insertOne(
        {
          userId,
          amount,
          type: amount > 0 ? "reward" : "deduction",
          date: new Date(),
        },
        { session }
      );

      success = true;
    });

    return NextResponse.json({ success }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
