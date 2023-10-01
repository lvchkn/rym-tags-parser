import { Channel, Connection, ConsumeMessage } from "amqplib";
import { upsertTask } from "../db/tasksRepo.js";
import { connectToRabbitMq } from "./amqp.js";
import { save } from "../services/dataSaver.js";
import { Task } from "../models/task.js";

let channel: Channel;
let connection: Connection;

process.once("SIGINT", async () => {
  await channel.close();
  await connection.close();
});

export async function startConsumer(): Promise<void> {
  connection = await connectToRabbitMq();
  channel = await connection.createChannel();

  const { queue } = await channel.assertQueue("parse-tasks-queue", {
    durable: true,
  });

  await channel.prefetch(2);
  await channel.consume(queue, onMessageHandler, { noAck: false });
}

async function onMessageHandler(message: ConsumeMessage | null): Promise<void> {
  if (message === null) {
    console.log("Error while receiving the message");
    return;
  }

  const json = message.content.toString();
  console.log("Message received!");

  const parseRequest = JSON.parse(json);
  const result = await save(parseRequest);

  console.log(JSON.stringify(result));

  const task: Task = {
    id: message.properties.messageId,
    status: "Completed",
  };

  const upsertTaskResult = await upsertTask(task);
  console.log("upsertTaskResult completed:", JSON.stringify(upsertTaskResult));

  channel.ack(message);
}
