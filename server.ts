import express, { Express } from "express";
import "./config.js";
import { connectToMongoDb } from "./db/mongo.js";
import { startConsumer } from "./mq/consumer.js";
import { rootRouter } from "./routers/rootRouter.js";
import { tasksRouter } from "./routers/tasksRouter.js";
import morgan from "morgan";
import { AddressInfo } from "net";
import { releasesRouter } from "./routers/releasesRouter.js";
import { IncomingMessage, Server, ServerResponse } from "http";

let connection: Server<typeof IncomingMessage, typeof ServerResponse>;

const app: Express = express();
const port = process.env.PORT || 3000;

const loggerFormat =
  process.env.NODE_ENV === "development" ? "dev" : "combined";

app.use(express.json());
app.use(morgan(loggerFormat));

app.use("/", rootRouter);
app.use("/tasks", tasksRouter);
app.use("/releases", releasesRouter);

export async function runServer() {
  await connectToMongoDb();
  await startConsumer();

  let currentPort = port;
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== "test") {
      app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
      });
      resolve(currentPort);
      return;
    } else {
      connection = app.listen(() => {
        currentPort = (<AddressInfo>connection.address()).port || port;
        console.log(`Test Server is listening on port ${currentPort}`);
        resolve(currentPort);
        return;
      });
    }
  });
}

export async function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.close(() => {
      resolve();
    });
  });
}

if (process.env.NODE_ENV !== "test") {
  runServer();
}
