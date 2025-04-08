'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Check, ChevronDown, ChevronUp, Plus, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Task = {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  completed: boolean;
  status: 'todo' | 'watch' | 'later' | 'done';
};

type Tab = 'todo' | 'watch' | 'later' | 'done';

export function TaskList() {
  const [activeTab, setActiveTab] = useState<Tab>('todo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Example Task',
      description: 'This is an example task description',
      dueDate: '2024-03-20T00:00:00.000Z',
      completed: false,
      status: 'todo'
    }
  ]);

  const filteredTasks = tasks
    .filter(task => task.status === activeTab)
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      const comparison = dateA - dateB;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const addNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      name: 'New Task',
      description: '',
      dueDate: new Date().toISOString(),
      completed: false,
      status: activeTab,
    };
    setTasks([...tasks, newTask]);
    setEditingTask(newTask.id);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  return (
    <div className="min-h-screen flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <TabButton active={activeTab === 'todo'} onClick={() => setActiveTab('todo')}>ToDo</TabButton>
            <TabButton active={activeTab === 'watch'} onClick={() => setActiveTab('watch')}>Watch</TabButton>
            <TabButton active={activeTab === 'later'} onClick={() => setActiveTab('later')}>Later</TabButton>
          </div>
          <TabButton active={activeTab === 'done'} onClick={() => setActiveTab('done')}>Done</TabButton>
        </div>
        
        <div className="bg-background rounded-lg shadow-sm">
          <div className="flex items-center justify-end p-2 border-b">
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Sort by date {sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
          
          <div>
            {filteredTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 group">
                <button 
                  className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => updateTask(task.id, { completed: !task.completed })}
                >
                  <Check className={cn(
                    "h-4 w-4",
                    task.completed ? "text-primary" : "opacity-0 group-hover:opacity-50"
                  )} />
                </button>
                
                <div className="flex-1 min-w-0">
                  {editingTask === task.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 justify-between">
                        <input
                          type="text"
                          value={task.name}
                          onChange={(e) => updateTask(task.id, { name: e.target.value })}
                          className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                          autoFocus
                        />
                        <input
                          type="date"
                          value={format(parseISO(task.dueDate), 'yyyy-MM-dd')}
                          onChange={(e) => updateTask(task.id, { dueDate: new Date(e.target.value).toISOString() })}
                          className="text-xs text-muted-foreground bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <textarea
                          value={task.description}
                          onChange={(e) => updateTask(task.id, { description: e.target.value })}
                          className="flex-1 bg-transparent text-xs text-muted-foreground focus:outline-none resize-none"
                          rows={1}
                        />
                        <button
                          onClick={() => setEditingTask(null)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setEditingTask(task.id)} className="cursor-pointer">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-sm font-medium leading-none">{task.name}</h3>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex-shrink-0">
                          {format(parseISO(task.dueDate), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t">
            <button
              onClick={addNewTask}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" /> Add new task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 text-xs rounded-md transition-colors",
        active 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
} 