import { Filter, WithId } from "mongodb";
import { FilterOptions } from "../routers/releasesRouter.js";
import { getClient } from "./mongo.js";
import { Release } from "../models/release.js";

const client = getClient();
const db = client.db("rymdata");
const releasesCollectionName = "releases";

function parseFilters(filterOptions: FilterOptions): Filter<Release> {
  const filter: Filter<Release> = {};

  if (filterOptions.artists.length > 0) {
    filter.artist = {
      $in: filterOptions.artists,
    };
  }

  if (filterOptions.albums.length > 0) {
    filter.album = {
      $in: filterOptions.albums,
    };
  }

  if (filterOptions.genres.length > 0) {
    filter.genres = {
      $all: filterOptions.genres,
    };
  }

  if (filterOptions.years.length > 0) {
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
    .find(filters)
    .collation({
      locale: "en",
      strength: 2,
    });
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
