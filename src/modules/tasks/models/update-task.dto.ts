import type { TaskPriority } from './task.model';

export type UpdateTaskDto = Partial<{
  name: string;
  description: string;
  dueDate: string; // yyyy-mm-dd
  priority: TaskPriority;
  completed: boolean;
}>;
