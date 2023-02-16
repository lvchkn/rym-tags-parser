import express, { Router, Request, Response } from "express";
import { ParseRequest } from "../parser.js";
import {
  getAllReleases,
  getAllReleasesInGenre,
} from "../db/releasesReadRepo.js";
import { publishMessage } from "../mq/publisher.js";

const rootRouter: Router = express.Router();

rootRouter.get("/", getAll);

rootRouter.get("/releases/:genre", getByGenre);

rootRouter.post("/parse", parseData);

async function getAll(req: Request, res: Response) {
  try {
    const releases = await getAllReleases();

    if (!releases || releases.length === 0) {
      res.status(404).send();
      return;
    }

    res.status(200).json(releases);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getByGenre(req: Request, res: Response) {
  try {
    const genre = req.params.genre;

    if (!genre) {
      res.status(400).send();
      return;
    }

    const releasesInGenre = await getAllReleasesInGenre(genre);

    if (!releasesInGenre || releasesInGenre.length === 0) {
      res.status(404).send();
      return;
    }

    res.status(200).json(releasesInGenre);
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
