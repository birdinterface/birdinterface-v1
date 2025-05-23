'use client';

import { useEffect, useState } from 'react';

import { auth } from '@/app/(auth)/auth';
import { RecurringTaskList } from '@/components/custom/recurring-task-list';
import { TaskList } from '@/components/custom/task-list';
import { createTask, updateTask as updateTaskApi, deleteTask as deleteTaskApi } from '@/lib/queries';
import { Task } from '@/lib/supabase';

import type { RecurringTask } from '@/components/custom/recurring-task-list';
import type { Task as UiTask } from '@/components/custom/task-list';

function toUiTask(task: any): UiTask {
  console.log('Converting task to UI task:', task);
  return {
    id: task.id,
    name: task.title,
    description: task.description,
    dueDate: task.duedate || '',
    completed: task.completed,
    status: task.status,
    completedAt: task.completedat || '',
    userId: task.userid,
  };
}

function toRecurringTask(task: any): RecurringTask {
  return {
    id: task.id,
    name: task.title,
    description: task.description,
    dueDate: task.duedate || '',
    completed: task.completed,
    completedAt: task.completedat || '',
    userId: task.userid,
    recurrencePattern: task.recurrencepattern || undefined,
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<UiTask[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  // TODO: Replace with real session userId
  const userId = tasks[0]?.userId || recurringTasks[0]?.userId || '26d545cb-63c5-461d-9fe9-8dc5256fe504'; // Use valid UUID for testing

  useEffect(() => {
    async function fetchTasks() {
      try {
        console.log('Frontend: Fetching tasks...');
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Frontend: Error fetching tasks:', errorData);
          throw new Error(errorData.error || `Failed to fetch tasks: ${response.status}`);
        }
        const data = await response.json();
        const uiTasks = data.map(toUiTask);
        console.log('Frontend: Tasks received:', uiTasks);
        setTasks(uiTasks);
        setError(null);
      } catch (err: any) {
        console.error('Frontend: Catch block error:', err);
        setError(err.message);
      }
    }

    async function fetchRecurringTasks() {
      try {
        console.log('Frontend: Fetching recurring tasks...');
        // For now, use empty array since we don't have recurring tasks API yet
        setRecurringTasks([]);
      } catch (err: any) {
        console.error('Frontend: Error fetching recurring tasks:', err);
      }
    }

    fetchTasks();
    fetchRecurringTasks();
  }, []);

  // Handler to add a new task (optimistic)
  const handleAddTask = async (task: Omit<UiTask, 'id'>) => {
    const realUserId = task.userId || userId;
    const tempId = 'temp-' + Date.now();
    const optimisticTask = { ...task, id: tempId, userId: realUserId };
    setTasks((prev) => [...prev, optimisticTask]);
    try {
      const created = await createTask(
        realUserId,
        {
          title: task.name,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
        }
      );
      setTasks((prev) => prev.map(t => t.id === tempId ? toUiTask(created) : t));
    } catch (err) {
      setTasks((prev) => prev.filter(t => t.id !== tempId));
      setError('Failed to add task');
      window.alert('Failed to add task');
    }
  };

  // Handler to add a new recurring task (optimistic)
  const handleAddRecurringTask = async (task: Omit<RecurringTask, 'id'>) => {
    const realUserId = task.userId || userId;
    const tempId = 'temp-recurring-' + Date.now();
    const optimisticTask = { ...task, id: tempId, userId: realUserId };
    setRecurringTasks((prev) => [...prev, optimisticTask]);
    // TODO: Implement actual API call for recurring tasks
    console.log('Adding recurring task:', optimisticTask);
  };

  const isValidUuid = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

  // Handler to update a task (optimistic)
  const handleUpdateTask = async (id: string, updates: Partial<UiTask>) => {
    console.log('Frontend: Updating task', id, 'with updates:', updates);
    const prevTasks = tasks;
    setTasks((prev) => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      const realUserId = updates.userId || tasks.find(t => t.id === id)?.userId || userId;
      if (!isValidUuid(realUserId)) {
        // Don't call backend for placeholder/empty tasks
        return;
      }
      const backendData = {
        title: updates.name,
        description: updates.description,
        dueDate: updates.dueDate,
        status: updates.status,
        completed: updates.completed,
        completedAt: updates.completedAt,
      };
      console.log('Frontend: Sending to backend:', backendData);
      const updated = await updateTaskApi(id, realUserId, backendData);
      console.log('Frontend: Backend response:', updated);
      setTasks((prev) => prev.map(t => t.id === id ? { ...t, ...updates, ...toUiTask(updated) } : t));
    } catch (err) {
      console.error('Frontend: Update task error:', err);
      setTasks(prevTasks);
      setError('Failed to update task');
      window.alert('Failed to update task');
    }
  };

  // Handler to update a recurring task (optimistic)
  const handleUpdateRecurringTask = async (id: string, updates: Partial<RecurringTask>) => {
    console.log('Frontend: Updating recurring task', id, 'with updates:', updates);
    setRecurringTasks((prev) => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    // TODO: Implement actual API call for recurring tasks
  };

  // Handler to delete a task (optimistic)
  const handleDeleteTask = async (id: string) => {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter(t => t.id !== id));
    try {
      const realUserId = tasks.find(t => t.id === id)?.userId || userId;
      if (!isValidUuid(realUserId)) {
        // Don't call backend for placeholder/empty tasks
        return;
      }
      await deleteTaskApi(id, realUserId);
    } catch (err) {
      setTasks(prevTasks);
      setError('Failed to delete task');
      window.alert('Failed to delete task');
    }
  };

  // Handler to delete a recurring task (optimistic)
  const handleDeleteRecurringTask = async (id: string) => {
    setRecurringTasks((prev) => prev.filter(t => t.id !== id));
    // TODO: Implement actual API call for recurring tasks
  };

  return (
    <div className="space-y-4">
      <TaskList
        tasks={tasks}
        userId={userId}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
      <RecurringTaskList
        tasks={recurringTasks}
        userId={userId}
        onAddTask={handleAddRecurringTask}
        onUpdateTask={handleUpdateRecurringTask}
        onDeleteTask={handleDeleteRecurringTask}
      />
    </div>
  );
} 