import express, { Router, Request, Response } from "express";
import { query, validationResult } from "express-validator";
import { getAllReleases } from "../db/releasesReadRepo.js";

const releasesRouter: Router = express.Router();

releasesRouter.get(
  "/",
  query("artists")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .escape(),

  query("albums")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .escape(),

  query("genres")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .escape(),

  query("years").optional({ checkFalsy: true, nullable: true }),

  getAll
);

export interface FilterOptions {
  artists?: string[];
  albums?: string[];
  genres?: string[];
  years?: number[];
}

async function getAll(req: Request, res: Response) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const filterOptions: FilterOptions = {};
  try {
    if (req.query.genres) {
      filterOptions.genres = (<string>req.query.genres).split(",");
    }

    if (req.query.artists) {
      filterOptions.artists = (<string>req.query.artists).split(",");
    }

    if (req.query.albums) {
      filterOptions.albums = (<string>req.query.albums).split(",");
    }

    if (req.query.years) {
      filterOptions.years = (<string>req.query.years).split(",").map(Number);
    }

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
