import { connectToRabbitMq } from "./amqp.js";

export const startConsumer = async (): Promise<void> => {
  const connection = await connectToRabbitMq();
  const channel = await connection.createChannel();

  process.once("SIGINT", async () => {
    await channel.close();
    await connection.close();
  });

  const exchangeName = "parse-tasks-exchange";
  await channel.assertExchange(exchangeName, "direct", { durable: true });

  const { queue } = await channel.assertQueue("parse-tasks-queue");
  await channel.bindQueue(queue, exchangeName, "parse-tasks-key");

  await channel.consume(queue, (msg) => {
    if (msg !== null) {
      console.log("Received message:", msg.content.toString());
      channel.ack(msg);
    } else {
      console.log("Error while receiving the message");
    }
  });
};
