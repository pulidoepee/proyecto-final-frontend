import type { TaskPriority } from './task.model';

export type CreateTaskDto = {
  name: string;
  description: string;
  dueDate: string; // yyyy-mm-dd
  priority: TaskPriority;
};
