import express, { Router, Request, Response } from "express";
import { getTask } from "../db/tasksRepo.js";

const tasksRouter: Router = express.Router();

tasksRouter.get("/:id", checkTaskStatus);

async function checkTaskStatus(req: Request, res: Response) {
  try {
    const taskId = req.params.id;
    if (!taskId) throw "Task Id should be a uuid formatted string";

    const task = await getTask(taskId);
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json(error);
  }
}

export { tasksRouter };
