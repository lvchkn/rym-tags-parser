import { Connection } from "amqplib";
import { v4 as uuidv4 } from "uuid";
import { exit } from "process";
import { connectToRabbitMq } from "./amqp.js";
import { upsertTask } from "../db/tasksRepo.js";
import { Task } from "../models/task.js";

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
    const queueName = "parse-tasks-queue";
    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      messageId: uuid,
      persistent: true,
    });

    console.log("Message published!");

    const task: Task = {
      id: uuid,
      status: "Pending",
    };

    const upsertTaskResult = await upsertTask(task);
    console.log("upsertTaskResult pending:", JSON.stringify(upsertTaskResult));

    return task;
  } finally {
    await channel.close();
  }
}
