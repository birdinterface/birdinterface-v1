'use client';

import { format, parseISO, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Check, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import React from 'react';
import { useState, useRef, KeyboardEvent, TouchEvent, useEffect } from 'react';

import { CustomCalendar } from '@/components/custom/custom-calendar';
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Task = {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  completed: boolean;
  status: 'todo' | 'watch' | 'later' | 'done';
  completedAt?: string;
};

type Tab = 'todo' | 'watch' | 'later' | 'done';

export function TaskList() {
  const [activeTab, setActiveTab] = useState<Tab>('todo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCompletedAnimation, setShowCompletedAnimation] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'default-todo',
      name: '',
      description: '',
      dueDate: '',
      completed: false,
      status: 'todo'
    },
    {
      id: 'default-watch',
      name: '',
      description: '',
      dueDate: '',
      completed: false,
      status: 'watch'
    },
    {
      id: 'default-later',
      name: '',
      description: '',
      dueDate: '',
      completed: false,
      status: 'later'
    }
  ]);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const lastTaskRef = useRef<string | null>(null);
  const [editingTab, setEditingTab] = useState<Tab | null>(null);
  const [tabNames, setTabNames] = useState({
    todo: 'ToDo',
    watch: 'Watch',
    later: 'Later',
    done: 'Completed'
  });

  const filteredTasks = tasks
    .filter(task => task.status === activeTab)
    .sort((a, b) => {
      if (activeTab === 'done' && a.completedAt && b.completedAt) {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      }
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      const comparison = dateA - dateB;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const formatDate = (date: string) => {
    if (!date) return '';
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) return 'Today';
    if (isYesterday(parsedDate)) return 'Yesterday';
    if (isTomorrow(parsedDate)) return 'Tomorrow';
    
    const daysDiff = Math.ceil((parsedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= 2 && daysDiff <= 6) {
      return format(parsedDate, 'EEEE');
    }
    
    return format(parsedDate, 'MMM d');
  };

  const addNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      name: '',
      description: '',
      dueDate: '',
      completed: false,
      status: activeTab,
    };
    setTasks([...tasks, newTask]);
    setTimeout(() => {
      const input = document.querySelector(`input[data-task-id="${newTask.id}"]`) as HTMLInputElement;
      if (input) input.focus();
    }, 0);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks => {
      const taskIndex = prevTasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return prevTasks;
      
      const task = prevTasks[taskIndex];
      const tasksInSameTab = prevTasks.filter(t => t.status === task.status);
      
      if (updates.completed && !task.completed) {
        if (!task.name.trim() && !task.description.trim()) {
          return prevTasks;
        }

        setShowCompletedAnimation(false);
        setTimeout(() => setShowCompletedAnimation(true), 0);
        setTimeout(() => setShowCompletedAnimation(false), 1000);

        const updatedTasks = [...prevTasks];
        updatedTasks[taskIndex] = {
          ...task,
          ...updates,
          name: task.name.trim() === '' ? ' ' : task.name,
          description: task.description.trim() === '' ? ' ' : task.description,
          completedAt: new Date().toISOString(),
          status: 'done'
        };

        if (tasksInSameTab.length === 1) {
          updatedTasks.push({
            id: Date.now().toString(),
            name: '',
            description: '',
            dueDate: '',
            completed: false,
            status: task.status,
          });
        }

        return updatedTasks;
      }

      if (updates.completed === false && task.completed) {
        const { completedAt, ...rest } = task;
        return prevTasks.map(t => 
          t.id === id ? {
            ...rest,
            ...updates,
            name: rest.name.trim(),
            description: rest.description.trim(),
            status: activeTab === 'done' ? 'todo' : activeTab
          } : t
        );
      }

      return prevTasks.map(t => 
        t.id === id ? { ...t, ...updates } : t
      );
    });
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (taskToDelete) {
      if (taskToDelete.status !== 'done') {
        const tasksInSameTab = tasks.filter(t => t.status === taskToDelete.status);
        if (tasksInSameTab.length <= 1) {
          return;
        }
      }
      setDeletedTasks(prev => [taskToDelete, ...prev]);
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const undoDelete = () => {
    if (deletedTasks.length > 0) {
      const [taskToRestore, ...remainingDeleted] = deletedTasks;
      setTasks(prev => [...prev, taskToRestore]);
      setDeletedTasks(remainingDeleted);
    }
  };

  const focusLastTask = () => {
    if (lastTaskRef.current) {
      const inputs = document.querySelectorAll(`input[data-task-id]`) as NodeListOf<HTMLInputElement>;
      const lastInput = Array.from(inputs).find(input => input.dataset.taskId === lastTaskRef.current);
      if (lastInput) {
        lastInput.focus();
        lastTaskRef.current = null;
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewTask();
    } else if (e.key === 'Backspace' && e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0 && tasks.length > 1) {
      e.preventDefault();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex > 0) {
        lastTaskRef.current = tasks[taskIndex - 1].id;
      }
      deleteTask(taskId);
      setTimeout(focusLastTask, 0);
    }
  };

  const handleTouchStart = (e: TouchEvent, taskId: string) => {
    setSwipeStartX(e.touches[0].clientX);
    setTaskToDelete(taskId);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (swipeStartX === null) return;
    const currentX = e.touches[0].clientX;
    const distance = swipeStartX - currentX;
    setSwipeDistance(Math.max(0, Math.min(distance, 100)));
  };

  const handleTouchEnd = () => {
    if (swipeDistance > 50 && taskToDelete) {
      deleteTask(taskToDelete);
    }
    setSwipeStartX(null);
    setSwipeDistance(0);
    setTaskToDelete(null);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'z' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        undoDelete();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown as any);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown as any);
  }, []);

  useEffect(() => {
    if (tasks.length === 0) {
      addNewTask();
    }
  }, [tasks.length]);

  return (
    <div className="w-full flex items-start justify-center">
      <div className="w-full max-w-2xl px-4">
        <div className="bg-background rounded-t-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {(['todo', 'watch', 'later'] as const).map(tab => (
                <TabButton 
                  key={tab}
                  active={activeTab === tab} 
                  onClick={() => setActiveTab(tab)}
                  onDoubleClick={() => setEditingTab(tab)}
                  isEditing={editingTab === tab}
                  value={tabNames[tab]}
                  onChange={(value) => {
                    setTabNames(prev => ({ ...prev, [tab]: value }));
                    setEditingTab(null);
                  }}
                >
                  {tabNames[tab]}
                </TabButton>
              ))}
            </div>
            <TabButton 
              active={activeTab === 'done'} 
              onClick={() => setActiveTab('done')}
            >
              <span className="task-tab">
                {tabNames.done}
              </span>
            </TabButton>
          </div>
        </div>
        
        <div className="space-y-2 bg-background rounded-b-lg p-4 pt-0">
          {filteredTasks.map(task => (
            <div 
              key={task.id}
              className="relative"
              onTouchStart={(e) => handleTouchStart(e, task.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="bg-background rounded-lg p-2 transition-transform flex items-start gap-2">
                {activeTab === 'done' ? (
                  <div className="mt-1 text-foreground flex">
                    <Check className="h-3 w-3" />
                    <Check className="h-3 w-3 -ml-2" />
                  </div>
                ) : (
                  <button 
                    className="mt-1 text-foreground hover:text-foreground transition-colors"
                    onClick={() => updateTask(task.id, { completed: !task.completed })}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="text"
                        value={activeTab === 'done' && task.name.trim() === ' ' ? '' : task.name}
                        onChange={(e) => updateTask(task.id, { name: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, task.id)}
                        className="flex-1 bg-transparent text-xs font-medium focus:outline-none task-input"
                        data-task-id={task.id}
                        placeholder="Task name"
                      />
                      <input
                        type="text"
                        value={activeTab === 'done' && task.description.trim() === ' ' ? '' : task.description}
                        onChange={(e) => updateTask(task.id, { description: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, task.id)}
                        className="flex-1 bg-transparent text-xs text-muted-foreground focus:outline-none task-input"
                        placeholder="Description"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {(activeTab as Tab) === 'done' ? (
                          task.completedAt ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground task-calendar-date">
                                  {format(parseISO(task.completedAt), 'MMM d')}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-0 rounded-none task-calendar" align="end">
                                <CustomCalendar
                                  selectedDate={task.completedAt ? parseISO(task.completedAt) : undefined}
                                  onDateSelect={(date) => {
                                    if (date) {
                                      updateTask(task.id, { completedAt: date.toISOString() });
                                    }
                                    const popoverTrigger = document.querySelector('[data-state="open"]');
                                    if (popoverTrigger) {
                                      (popoverTrigger as HTMLButtonElement).click();
                                    }
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground task-calendar-date">
                                  <Calendar className="h-3 w-3" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-0 rounded-none task-calendar" align="end">
                                <CustomCalendar
                                  selectedDate={undefined}
                                  onDateSelect={(date) => {
                                    if (date) {
                                      updateTask(task.id, { completedAt: date.toISOString() });
                                    }
                                    const popoverTrigger = document.querySelector('[data-state="open"]');
                                    if (popoverTrigger) {
                                      (popoverTrigger as HTMLButtonElement).click();
                                    }
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          )
                        ) : task.dueDate ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-muted-foreground hover:text-foreground task-calendar-date">
                                {formatDate(task.dueDate)}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-0 rounded-none task-calendar" align="end">
                              <CustomCalendar
                                selectedDate={task.dueDate ? parseISO(task.dueDate) : undefined}
                                onDateSelect={(date) => {
                                  updateTask(task.id, { dueDate: date?.toISOString() || '' });
                                  const popoverTrigger = document.querySelector('[data-state="open"]');
                                  if (popoverTrigger) {
                                    (popoverTrigger as HTMLButtonElement).click();
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        ) : null}
                      </span>
                      {activeTab !== 'done' && !task.dueDate && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="text-muted-foreground hover:text-foreground task-calendar-date"
                            >
                              <Calendar className="h-3 w-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-0 rounded-none task-calendar" align="end">
                            <CustomCalendar
                              selectedDate={task.dueDate ? parseISO(task.dueDate) : undefined}
                              onDateSelect={(date) => {
                                updateTask(task.id, { dueDate: date?.toISOString() || '' });
                                const popoverTrigger = document.querySelector('[data-state="open"]');
                                if (popoverTrigger) {
                                  (popoverTrigger as HTMLButtonElement).click();
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && activeTab !== 'done' && (
            <div className="bg-background rounded-lg p-2 transition-transform flex items-start gap-2">
              <button 
                className="mt-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Check className="h-3 w-3 opacity-0" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="text"
                      className="flex-1 bg-transparent text-xs font-medium focus:outline-none"
                      placeholder="Task name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addNewTask();
                        }
                      }}
                      autoFocus
                    />
                    <input
                      type="text"
                      className="flex-1 bg-transparent text-xs text-muted-foreground focus:outline-none"
                      placeholder="Description"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap"></span>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Calendar className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ 
  children, 
  active, 
  onClick,
  onDoubleClick,
  isEditing,
  value,
  onChange,
  className
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  onDoubleClick?: () => void;
  isEditing?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const spanRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (isEditing && spanRef.current) {
      spanRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(spanRef.current);
      range.collapse(false);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [isEditing]);

  if (isEditing && value !== undefined && onChange) {
    return (
      <span
        ref={spanRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const newValue = e.currentTarget.textContent || value;
          onChange(newValue);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onChange(e.currentTarget.textContent || value);
          }
        }}
        className={cn(
          "px-2 py-1 text-xs outline-none task-tab",
          active 
            ? "text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {value}
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "px-2 py-1 text-xs transition-colors task-tab",
        active 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
} 