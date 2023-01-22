import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

const user = process.env.MONGO_USER;
const pw = process.env.MONGO_PW;
const clusterUrl = process.env.MONGO_CLUSTERURL;

const uri = `mongodb://${user}:${pw}@${clusterUrl}:27017?retryWrites=false&w=majority`;
const client = new MongoClient(uri);

const connectToMongoDb = async () => {
  try {
    await client.connect();
    console.log("Successfully connected to Mongo!");
  } catch (error) {
    console.error("Error occurred while connecting to Mongo!", error);
    await client.close();
  }
};

const getClient = () => client;

export { connectToMongoDb, getClient };
