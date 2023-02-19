import express, { Router, Request, Response } from "express";
import { getAllReleases } from "../db/releasesReadRepo.js";
import { query, validationResult } from "express-validator";

const releasesRouter: Router = express.Router();

releasesRouter.get(
  "/",
  query("artist")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .escape(),

  query("album").optional({ checkFalsy: true, nullable: true }).trim().escape(),

  query("genres")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .escape(),

  query("year").optional({ checkFalsy: true, nullable: true }).isInt(),
  getAll
);

export interface FilterOptions {
  artist?: string;
  album?: string;
  genres?: string[];
  year?: number;
}

async function getAll(req: Request, res: Response) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const filterOptions: FilterOptions = {};

  if (req.query.genres)
    filterOptions.genres = (<string>req.query.genres).split(",");
  if (req.query.artist) filterOptions.artist = <string>req.query.artist;
  if (req.query.album) filterOptions.album = <string>req.query.album;
  if (req.query.year) filterOptions.year = Number(req.query.year);

  try {
    const releases = await getAllReleases(filterOptions);

    if (!releases || releases.length === 0) {
      return res.status(404).send();
    }

    return res.status(200).json(releases);
  } catch (error) {
    return res.status(500).json(error);
  }
}

export { releasesRouter };
