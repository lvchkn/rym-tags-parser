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
  } catch (error) {
    console.error("Error occurred while connecting to Mongo!", error);
    await client.close();
  }
}

export function getClient() {
  return client;
}
