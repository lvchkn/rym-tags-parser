import { WithId } from "mongodb";
import { getClient } from "./mongo.js";
import { Task } from "../models/task.js";

const client = getClient();
const db = client.db("rymdata");
const tasksCollectionName = "tasks";

export async function getTask(taskId: string): Promise<WithId<Task>> {
  const task = await db
    .collection<Task>(tasksCollectionName)
    .findOne({ id: taskId });

  if (task) return task;

  throw "Task with this id is not found";
}

export async function upsertTask(task: Task) {
  const filter = { id: task.id };
  const update = { $set: { id: task.id, status: task.status } };
  const options = { upsert: true };

  try {
    const result = await db
      .collection<Task>(tasksCollectionName)
      .updateOne(filter, update, options);

    return {
      ack: result.acknowledged,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
    };
  } catch (error) {
    console.error(error);
    return {
      ack: false,
      modifiedCount: 0,
      upsertedCount: 0,
    };
  }
}
