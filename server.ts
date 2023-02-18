import express, { Express } from "express";
import "./config.js";
import { connectToMongoDb } from "./db/mongo.js";
import { startConsumer } from "./mq/consumer.js";
import { rootRouter } from "./routers/rootRouter.js";
import { tasksRouter } from "./routers/tasksRouter.js";
import morgan from "morgan";
import { AddressInfo } from "net";

/* TODO: 
  1) Remove span class inner html;
  2) Add sort / filter APIs
*/

const app: Express = express();
const port = process.env.PORT || 3000;
const loggerFormat =
  process.env.NODE_ENV === "development" ? "dev" : "combined";

app.use(express.json());
app.use(morgan(loggerFormat));

app.use("/", rootRouter);
app.use("/tasks", tasksRouter);

export async function run() {
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
      const connection = app.listen(() => {
        currentPort = (<AddressInfo>connection.address()).port || port;
        console.log(`Test Server is listening on port ${currentPort}`);
        resolve(currentPort);
        return;
      });
    }
  });
}

if (process.env.NODE_ENV !== "test") {
  run();
}
