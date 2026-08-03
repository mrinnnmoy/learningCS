import { TaskCreated, TaskAssigned, StatusUpdated } from "../generated/TaskRegistry/TaskRegistry";
import { Task } from "../generated/schema";

const STATUS_NAMES = ["Open", "InProgress", "Done"];

export function handleTaskCreated(event: TaskCreated): void {
  let task = new Task(event.params.id.toString());
  task.taskId = event.params.id;
  task.description = event.params.description;
  task.status = STATUS_NAMES[0];
  task.createdAtBlock = event.block.number;
  task.updatedAtBlock = event.block.number;
  task.save();
}

export function handleTaskAssigned(event: TaskAssigned): void {
  let task = Task.load(event.params.id.toString());
  if (task == null) return;
  task.assignedTo = event.params.to;
  task.updatedAtBlock = event.block.number;
  task.save();
}

export function handleStatusUpdated(event: StatusUpdated): void {
  let task = Task.load(event.params.id.toString());
  if (task == null) return;
  task.status = STATUS_NAMES[event.params.newStatus];
  task.updatedAtBlock = event.block.number;
  task.save();
}
