import amqplib, { Connection } from "amqplib";

const host = process.env.RMQ_HOST;

const connectToRabbitMq = async (): Promise<Connection> => {
  try {
    const connection = await amqplib.connect(`amqp://${host}`);
    console.log("Successfully connected to RabbitMQ!");
    return connection;
  } catch (error) {
    throw ("Error occured while connecting to RabbitMQ!", error);
  }
};

export { connectToRabbitMq };
