import { Filter, WithId } from "mongodb";
import { Release } from "../parser.js";
import { FilterOptions } from "../routers/releasesRouter.js";
import { getClient } from "./mongo.js";

const client = getClient();
const db = client.db("rymdata");
const releasesCollectionName = "releases";

function parseFilters(filterOptions: FilterOptions): Filter<Release> {
  let filter: Filter<Release> = {};

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

export async function getReleaseByAlbumName(
  album: string
): Promise<WithId<Release>> {
  const release = await db
    .collection<Release>(releasesCollectionName)
    .findOne({ album });

  if (release) return release;

  throw "Album with this name is not found";
}

export async function getAllReleasesInGenre(
  genre: string
): Promise<WithId<Release>[]> {
  const releasesCursor = db
    .collection<Release>(releasesCollectionName)
    .find({ genres: { $in: [genre] } });

  const releases = releasesCursor.toArray();

  return releases;
}

export async function getAllReleasesInYear(
  year: Number
): Promise<WithId<Release>[]> {
  const releasesCursor = db
    .collection<Release>(releasesCollectionName)
    .find({ year });

  const releases = releasesCursor.toArray();

  return releases;
}

export async function getAllAlbumsByArtist(
  artist: string
): Promise<WithId<Release>[]> {
  const releasesCursor = db
    .collection<Release>(releasesCollectionName)
    .find({ artist });

  const releases = releasesCursor.toArray();

  return releases;
}
