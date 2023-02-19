import { Filter, WithId } from "mongodb";
import { Release } from "../parser.js";
import { FilterOptions } from "../routers/releasesRouter.js";
import { getClient } from "./mongo.js";

const client = getClient();
const db = client.db("rymdata");

const parseFilters = (filterOptions: FilterOptions): Filter<Release> => {
  let filter: Filter<Release> = {};

  if (filterOptions.artist) {
    filter.artist = filterOptions.artist;
  }

  if (filterOptions.album) {
    filter.album = filterOptions.album;
  }

  if (filterOptions.genres) {
    filter.genres = {
      $all: filterOptions.genres,
    };
  }

  if (filterOptions.year) {
    filter.year = filterOptions.year;
  }

  return filter;
};

export const getAllReleases = async (
  filterOptions: FilterOptions
): Promise<WithId<Release>[]> => {
  const filters = parseFilters(filterOptions);

  const releasesCursor = db.collection<Release>("releases").find(filters);
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
  const releasesCursor = db
    .collection<Release>("releases")
    .find({ genres: { $in: [genre] } });

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
