import { AnyBulkWriteOperation } from "mongodb";
import { Release } from "../parser.js";
import { getClient } from "./mongo.js";

const client = getClient();
const db = client.db("rymdata");

export interface AddResult {
  ack: boolean;
  insertedCount: number;
  upsertedCount: number;
}

export const addNewReleases = async (
  releases: Release[]
): Promise<AddResult> => {
  try {
    const bulkUpdate: AnyBulkWriteOperation<Release>[] = releases.map(
      (release) => {
        return {
          updateOne: {
            filter: { artist: release.artist, album: release.album },
            update: { $set: release },
            upsert: true,
          },
        };
      }
    );

    const result = await db
      .collection<Release>("releases")
      .bulkWrite(bulkUpdate);

    return {
      ack: result.isOk(),
      insertedCount: result.insertedCount,
      upsertedCount: result.upsertedCount,
    };
  } catch (error: any) {
    console.error(error);
    return {
      ack: false,
      insertedCount: error?.result?.result?.insertedCount,
      upsertedCount: error?.result?.result?.upsertedCount,
    };
  }
};
