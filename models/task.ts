export type TaskStatus = "Pending" | "Completed";

export interface Task {
  id: string;
  status: TaskStatus;
}
