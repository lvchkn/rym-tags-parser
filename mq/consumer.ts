import { ConsumeMessage } from "amqplib";
import { Task, upsertTask } from "../db/tasksRepo.js";
import { parseAndSave } from "../parser.js";
import { connectToRabbitMq } from "./amqp.js";

export async function startConsumer(): Promise<void> {
  const connection = await connectToRabbitMq();
  const channel = await connection.createChannel();

  process.once("SIGINT", async () => {
    await channel.close();
    await connection.close();
  });

  const { queue } = await channel.assertQueue("parse-tasks-queue", {
    durable: true,
  });

  await channel.prefetch(2);

  await channel.consume(
    queue,
    async (message: ConsumeMessage | null) => {
      if (message !== null) {
        const json = message.content.toString();
        console.log("Message received!");

        const parseRequest = JSON.parse(json);
        const result = await parseAndSave(parseRequest);

        console.log(JSON.stringify(result));

        const task: Task = {
          id: message.properties.messageId,
          status: "Completed",
        };

        const upsertTaskResult = await upsertTask(task);
        console.log(
          "upsertTaskResult completed:",
          JSON.stringify(upsertTaskResult)
        );

        channel.ack(message);
      } else {
        console.log("Error while receiving the message");
      }
    },
    { noAck: false }
  );
}
