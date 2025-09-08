import clientPromise from "@/lib/mongodb";
import { User } from "@/models";

export async function rewardTokens(userId: string, amount: number) {
  const client = await clientPromise;
  const session = client.startSession();

  let success = false;

  await session.withTransaction(async () => {
    const users = client.db("data").collection<User>("users");
    const transactions = client.db("data").collection("transactions");

    // 1. Credita os pontos
    await users.findOneAndUpdate(
      { _id: userId },
      { $inc: { tkn: amount } },
      { session, upsert: true }
    );

    // 2. Log da transação
    await transactions.insertOne(
      {
        userId,
        amount,
        type: "reward",
        date: new Date(),
      },
      { session }
    );

    success = true;
  });

  return success;
}
