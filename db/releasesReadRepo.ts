import { Filter, WithId } from "mongodb";
import { Release } from "../parser.js";
import { FilterOptions } from "../routers/releasesRouter.js";
import { getClient } from "./mongo.js";

const client = getClient();
const db = client.db("rymdata");

export const getAllReleases = async (
  filterOptions: FilterOptions
): Promise<WithId<Release>[]> => {
  const releasesCursor = db.collection<Release>("releases").find(filterOptions);
  const releases = releasesCursor.toArray();

  return releases;
};

export const getReleaseByAlbumName = async (
  album: string
): Promise<WithId<Release>> => {
  const release = await db.collection<Release>("releases").findOne({ album });

  if (release) return release;

  throw "Album with this name is not found";
};

export const getAllReleasesInGenre = async (
  genre: string
): Promise<WithId<Release>[]> => {
  const releasesCursor = db.collection<Release>("releases").find({ genre });

  const releases = releasesCursor.toArray();

  return releases;
};

export const getAllReleasesInYear = async (
  year: Number
): Promise<WithId<Release>[]> => {
  const releasesCursor = db.collection<Release>("releases").find({ year });

  const releases = releasesCursor.toArray();

  return releases;
};

export const getAllAlbumsByArtist = async (
  artist: string
): Promise<WithId<Release>[]> => {
  const releasesCursor = db.collection<Release>("releases").find({ artist });

  const releases = releasesCursor.toArray();

  return releases;
};
