import { ConsumeMessage } from "amqplib";
import { parseAndSave } from "../parser.js";
import { connectToRabbitMq } from "./amqp.js";

export const startConsumer = async (): Promise<void> => {
  const connection = await connectToRabbitMq();
  const channel = await connection.createChannel();

  process.once("SIGINT", async () => {
    await channel.close();
    await connection.close();
  });

  const exchangeName = "parse-tasks-exchange";
  await channel.assertExchange(exchangeName, "direct", { durable: false });

  const { queue } = await channel.assertQueue("parse-tasks-queue");
  await channel.bindQueue(queue, exchangeName, "parse-tasks-key");

  await channel.consume(queue, async (message: ConsumeMessage | null) => {
    if (message !== null) {
      const json = message.content.toString();
      const parseRequest = JSON.parse(json);
      const result = await parseAndSave(parseRequest);

      console.log(JSON.stringify(result));
      channel.ack(message);
    } else {
      console.log("Error while receiving the message");
    }
  });
};
