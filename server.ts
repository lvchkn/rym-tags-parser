import express, { Express } from "express";
import "./config.js";
import { connectToMongoDb } from "./db/mongo.js";
import { startConsumer } from "./mq/consumer.js";
import { rootRouter } from "./routers/rootRouter.js";
import { tasksRouter } from "./routers/tasksRouter.js";
import morgan from "morgan";

/* TODO: 
  1) Remove span class inner html;
  2) Add sort / filter APIs
  3) Reduce docker image size
  4) Add compose overrides for dev/test envs
*/

const app: Express = express();
const port = Number(process.env.PORT) || 3000;
const loggerFormat =
  process.env.NODE_ENV === "development" ? "dev" : "combined";

app.use(express.json());
app.use(morgan(loggerFormat));

app.use("/", rootRouter);
app.use("/tasks", tasksRouter);

(async () => {
  await connectToMongoDb();
  await startConsumer();

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
})();
