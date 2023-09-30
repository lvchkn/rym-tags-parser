import express, { Router, Request, Response } from "express";
import { publishMessage } from "../mq/publisher.js";
import { ParseRequest } from "../models/parseRequest.js";

const rootRouter: Router = express.Router();

rootRouter.post("/parse", parseData);

async function parseData(req: Request, res: Response) {
  const parseData: ParseRequest = req.body;
  const result = await publishMessage(parseData);
  res.status(202).json(result);
}

export { rootRouter };
