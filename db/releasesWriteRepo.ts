import { Release } from "../parser.js";
import { getClient } from "./mongo.js";

const client = getClient();
const db = client.db("rymdata");

export const addNewReleases = async (releases: Release[]) => {
  try {
    const result = await db
      .collection<Release>("releases")
      .insertMany(releases, { ordered: false });

    return {
      ack: result.acknowledged,
      count: result.insertedCount,
    };
  } catch (error: any) {
    return {
      ack: false,
      count: error.result.result.insertedCount,
    };
  }
};
