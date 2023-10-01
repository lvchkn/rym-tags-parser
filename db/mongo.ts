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

  const options = {
    collation: {
      locale: "en",
      strength: 2,
    },
  };

  await db.collection(collectionName).createIndex({ artist: 1 }, options);
  await db.collection(collectionName).createIndex({ album: 1 }, options);
  await db.collection(collectionName).createIndex({ genres: 1 }, options);
  await db.collection(collectionName).createIndex({ year: 1 }, options);
}

export function getClient() {
  return client;
}
