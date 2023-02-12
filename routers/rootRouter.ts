import express, { Router, Request, Response } from "express";
import { ParseRequest } from "../parser.js";
import { getAllReleases } from "../db/releasesReadRepo.js";
import { publishMessage } from "../mq/publisher.js";

const rootRouter: Router = express.Router();

rootRouter.get("/", getData);

rootRouter.post("/parse", parseData);

async function getData(req: Request, res: Response) {
  try {
    const releases = await getAllReleases();
    res.status(200).json(releases);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function parseData(req: Request, res: Response) {
  const parseData: ParseRequest = req.body;
  const result = await publishMessage(parseData);
  res.status(202).json(result);
}

export { rootRouter };
