import { Connection } from "amqplib";
import { exit } from "process";
import { connectToRabbitMq } from "./amqp.js";

let connection: Connection | null = null;

process.on("SIGINT", async () => {
  await connection?.close();
  exit();
});

export const publishMessage = async (message) => {
  if (!connection) {
    connection = await connectToRabbitMq();
  }

  const channel = await connection.createChannel();

  try {
    const exchangeName = "parse-tasks-exchange";
    await channel.assertExchange(exchangeName, "direct", { durable: true });

    channel.publish(
      exchangeName,
      "parse-tasks-key",
      Buffer.from(JSON.stringify(message))
    );
  } finally {
    await channel.close();
  }

  return {
    status: "pending",
  };
};
