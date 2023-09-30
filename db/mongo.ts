import { MongoClient } from "mongodb";

const user = process.env.MONGO_USER;
const pw = process.env.MONGO_PW;
const clusterUrl = process.env.MONGO_CLUSTERURL;

const uri = `mongodb://${user}:${pw}@${clusterUrl}`;

const client = new MongoClient(uri);

export async function connectToMongoDb() {
  try {
    await client.connect();
    console.log("Successfully connected to Mongo!");
    await createIndexes();
  } catch (error) {
    console.error("Error occurred while connecting to Mongo!", error);
    await client.close();
  }
}

async function createIndexes(): Promise<void> {
  const collectionName = "releases";
  const db = client.db("rymdata");

  const indexes = { artist: 1, album: 1, genres: 1, year: 1 };

  const options = {
    collation: {
      locale: "en",
      strength: 2,
    },
  };

  await db.collection(collectionName).createIndex(indexes, options);
}

export function getClient() {
  return client;
}
