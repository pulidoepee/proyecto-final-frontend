import apiClient from '@/api/apiClient';
import type { CreateTaskDto } from '../models/create-task.dto';
import type { Task } from '../models/task.model';
import type { UpdateTaskDto } from '../models/update-task.dto';

export async function getTasks() {
  const { data } = await apiClient.get<Task[]>('/tasks');
  return data;
}

export async function getTaskById(id: string) {
  const { data } = await apiClient.get<Task>(`/tasks/${id}`);
  return data;
}

export async function createTask(payload: CreateTaskDto) {
  const { data } = await apiClient.post<Task>('/tasks', payload);
  return data;
}

/** PATCH parcial: envía SOLO los campos modificados */
export async function updateTask(id: string, payload: UpdateTaskDto) {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}`, payload);
  return data;
}

/** Endpoint de acción: completar una tarea */
export async function completeTask(id: string) {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}/complete`);
  return data;
}

export async function completeAllPendingTasks() {
  await apiClient.patch('/tasks/complete/all');
}

export async function deleteAllCompletedTasks() {
  await apiClient.delete('/tasks/completed/all');
}
