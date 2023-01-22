import express, { Request, Response } from "express";
import { connectToMongoDb } from "./db/mongo.js";
import { getAllReleases } from "./db/releasesReadRepo.js";
import { publishMessage } from "./mq/publisher.js";
import { startConsumer } from "./mq/consumer.js";

/* TODO: 
  1) Remove span class inner html;
  2) Add sort / filter APIs
*/

interface ParseData {
  profile: string;
  fromPage: number;
  toPage: number;
}

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

const getData = async (req: Request, res: Response) => {
  try {
    const releases = await getAllReleases();
    res.status(200).json(releases);
  } catch (error) {
    res.status(500).json(error);
  }
};

const postData = async (req: Request, res: Response) => {
  const body = req.body;
  const parseData: ParseData = body;
  const result = await publishMessage(parseData);
  res.status(202).json(result);
};

app.get("/", getData);

app.post("/parse", postData);

(async () => {
  await connectToMongoDb();
  await startConsumer();

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
})();
