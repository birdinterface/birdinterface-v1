import { Suspense } from 'react';
import { TaskList } from '@/components/custom/task-list';

export const runtime = 'edge';

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskList />
    </Suspense>
  );
} 