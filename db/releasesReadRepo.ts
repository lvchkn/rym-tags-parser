import { Filter, WithId } from "mongodb";
import { Release } from "../parser.js";
import { FilterOptions } from "../routers/releasesRouter.js";
import { getClient } from "./mongo.js";

const client = getClient();
const db = client.db("rymdata");
const releasesCollectionName = "releases";

function parseFilters(filterOptions: FilterOptions): Filter<Release> {
  const filter: Filter<Release> = {};

  if (filterOptions.artists) {
    filter.artist = {
      $in: filterOptions.artists,
    };
  }

  if (filterOptions.albums) {
    filter.album = {
      $in: filterOptions.albums,
    };
  }

  if (filterOptions.genres) {
    filter.genres = {
      $all: filterOptions.genres,
    };
  }

  if (filterOptions.years) {
    filter.year = {
      $in: filterOptions.years,
    };
  }

  return filter;
}

export async function getAllReleases(
  filterOptions: FilterOptions
): Promise<WithId<Release>[]> {
  const filters = parseFilters(filterOptions);

  const releasesCursor = db
    .collection<Release>(releasesCollectionName)
    .find(filters);
  const releases = releasesCursor.toArray();

  return releases;
}

export async function getAllArtists(): Promise<string[]> {
  const releasesCursor = db
    .collection<Release>(releasesCollectionName)
    .find()
    .project({ _id: 0, artist: 1 });

  const releases = await releasesCursor.toArray();
  const artists: string[] = releases.map((release) => release.artist);

  return artists;
}

export async function getAllAlbums(): Promise<string[]> {
  const releasesCursor = db
    .collection<Release>(releasesCollectionName)
    .find()
    .project({ _id: 0, album: 1 });

  const releases = await releasesCursor.toArray();
  const albums: string[] = releases.map((release) => release.album);

  return albums;
}

export async function getAllGenres(): Promise<string[]> {
  const releasesCursor = db
    .collection<Release>(releasesCollectionName)
    .distinct("genres");

  const genres = await releasesCursor;

  return genres;
}
