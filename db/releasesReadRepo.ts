import { Filter, WithId } from "mongodb";
import { getClient } from "./mongo.js";
import { Release } from "../models/release.js";
import { Query } from "../services/queryProcessor.js";

const client = getClient();
const db = client.db("rymdata");
const releasesCollectionName = "releases";

function parseFilters(query: Query): Filter<Release> {
  const { artists, albums, genres, years } = query;
  const filter: Filter<Release> = {};

  if (artists.length > 0) {
    filter.artist = {
      $in: artists,
    };
  }

  if (albums.length > 0) {
    filter.album = {
      $in: albums,
    };
  }

  if (genres.length > 0) {
    filter.genres = {
      $all: genres,
    };
  }

  if (years.length > 0) {
    filter.year = {
      $in: years,
    };
  }

  return filter;
}

export async function getAllReleases(query: Query): Promise<WithId<Release>[]> {
  const filters = parseFilters(query);

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
