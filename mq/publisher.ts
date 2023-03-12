import { Connection } from "amqplib";
import { v4 as uuidv4 } from "uuid";
import { exit } from "process";
import { connectToRabbitMq } from "./amqp.js";
import { Task, upsertTask } from "../db/tasksRepo.js";

let connection: Connection | null = null;

process.on("SIGINT", async () => {
  await connection?.close();
  exit();
});

export async function publishMessage(message) {
  if (!connection) {
    connection = await connectToRabbitMq();
  }

  const channel = await connection.createChannel();
  const uuid = uuidv4();

  try {
    const exchangeName = "parse-tasks-exchange";
    await channel.assertExchange(exchangeName, "direct", { durable: false });

    channel.publish(
      exchangeName,
      "parse-tasks-key",
      Buffer.from(JSON.stringify(message)),
      { messageId: uuid }
    );

    console.log("Message published!");

    const task: Task = {
      id: uuid,
      status: "pending",
    };

    const upsertTaskResult = await upsertTask(task);
    console.log("upsertTaskResult pending:", JSON.stringify(upsertTaskResult));

    return task;
  } finally {
    await channel.close();
  }
}
