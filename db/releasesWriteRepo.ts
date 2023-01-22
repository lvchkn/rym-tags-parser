import { Release } from "../parser.js";
import { getClient } from "./mongo.js";

const client = getClient();
const db = client.db("rymdata");

export interface AddResult {
  ack: boolean;
  count: number;
}

export const addNewReleases = async (
  releases: Release[]
): Promise<AddResult> => {
  try {
    const result = await db
      .collection<Release>("releases")
      .insertMany(releases, { ordered: false });

    return {
      ack: result.acknowledged,
      count: result.insertedCount,
    };
  } catch (error: any) {
    console.error(error);
    return {
      ack: false,
      count: error.result.result.insertedCount,
    };
  }
};
