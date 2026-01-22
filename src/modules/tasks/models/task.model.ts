export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskUser = {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  priority: TaskPriority;
  user?: TaskUser;
};
