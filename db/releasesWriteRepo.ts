import {
  AnyBulkWriteOperation,
  BulkWriteResult,
  MongoBulkWriteError,
} from "mongodb";
import { Release } from "../parser.js";
import { getClient } from "./mongo.js";

const client = getClient();
const db = client.db("rymdata");
const releasesCollectionName = "releases";

export interface AddResult {
  ack: boolean;
  insertedCount: number;
  upsertedCount: number;
}

export async function addNewReleases(releases: Release[]): Promise<AddResult> {
  try {
    const bulkUpdate: AnyBulkWriteOperation<Release>[] = releases.map(
      (release) => {
        return {
          updateOne: {
            filter: { artist: release.artist, album: release.album },
            update: {
              $setOnInsert: {
                artist: release.artist,
                album: release.album,
                genres: release.genres,
                year: release.year,
              },
            },
            upsert: true,
          },
        };
      }
    );

    let result = <BulkWriteResult>{};

    if (bulkUpdate.length > 0) {
      result = await db
        .collection<Release>(releasesCollectionName)
        .bulkWrite(bulkUpdate);
    }

    return {
      ack: result.isOk(),
      insertedCount: result.insertedCount,
      upsertedCount: result.upsertedCount,
    };
  } catch (error: unknown) {
    console.error(error);

    return {
      ack: false,
      insertedCount: (<MongoBulkWriteError>error).result.insertedCount,
      upsertedCount: (<MongoBulkWriteError>error).result.upsertedCount,
    };
  }
}
