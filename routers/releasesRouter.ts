import express, { Router, Request, Response } from "express";
import { query, validationResult } from "express-validator";
import {
  getAllAlbums,
  getAllArtists,
  getAllGenres,
  getAllReleases,
} from "../db/releasesReadRepo.js";
import { getQuery } from "../services/queryProcessor.js";

const releasesRouter: Router = express.Router();

releasesRouter.get(
  "/",
  [
    query("artists").trim().escape().optional(),
    query("albums").trim().escape().optional(),
    query("genres").trim().escape().optional(),
    query("years").optional(),
  ],
  getAll
);

releasesRouter.get("/artists", getArtists);
releasesRouter.get("/albums", getAlbums);
releasesRouter.get("/genres", getGenres);

async function getAll(req: Request, res: Response) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const query = getQuery(req);

  try {
    const releases = await getAllReleases(query);

    if (!releases || releases.length === 0) {
      return res.status(404).send();
    }

    return res.status(200).json(releases);
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getArtists(_: Request, res: Response) {
  const artists = await getAllArtists();

  if (artists.length === 0) {
    return res.status(404).send();
  }

  return res.status(200).json(artists);
}

async function getAlbums(_: Request, res: Response) {
  const albums = await getAllAlbums();

  if (albums.length === 0) {
    return res.status(404).send();
  }

  return res.status(200).json(albums);
}

async function getGenres(_: Request, res: Response) {
  const genres = await getAllGenres();

  if (genres.length === 0) {
    return res.status(404).send();
  }

  return res.status(200).json(genres);
}

export { releasesRouter };
