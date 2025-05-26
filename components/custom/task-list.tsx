'use client';

import { format, parseISO, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Check, ChevronDown, ChevronUp, Calendar, Edit2 } from 'lucide-react';
import React, { useState, useRef, KeyboardEvent, TouchEvent, useEffect, DragEvent, useCallback } from 'react';

import { CustomCalendar } from '@/components/custom/custom-calendar';
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type Task = {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  completed: boolean;
  status: 'todo' | 'watch' | 'later' | 'done';
  completedAt?: string;
  userId: string;
};

type Tab = 'todo' | 'watch' | 'later' | 'done';

export function TaskList({
  tasks: externalTasks,
  userId,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: {
  tasks?: Task[];
  userId: string;
  onAddTask?: (task: Omit<Task, 'id'>) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onDeleteTask?: (id: string) => void;
}) {
  // If tasks are provided as a prop, use them directly (controlled component)
  const tasks = externalTasks ?? [];
  const [activeTab, setActiveTab] = useState<Tab>('todo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCompletedAnimation, setShowCompletedAnimation] = useState(false);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const lastTaskRef = useRef<string | null>(null);
  const [editingTab, setEditingTab] = useState<Tab | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [tabNames, setTabNames] = useState({
    todo: 'ToDo',
    watch: 'Watch',
    later: 'Later',
    done: 'Completed'
  });
  const [dragOverTarget, setDragOverTarget] = useState<Tab | null>(null);
  const [emptyTaskData, setEmptyTaskData] = useState({ name: '', description: '' });
  const lastTaskInputRef = useRef<HTMLInputElement | null>(null);
  const shouldFocusNewTaskRef = useRef(false);
  const focusAttemptCountRef = useRef(0);
  const maintainFocusRef = useRef(false);
  const focusedTaskPositionRef = useRef<number>(-1);

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

  // If there are no tasks for the active tab, show an empty editable row
  const displayTasks = filteredTasks.length > 0 ? filteredTasks : [{
    id: 'empty',
    name: emptyTaskData.name,
    description: emptyTaskData.description,
    dueDate: '',
    completed: false,
    status: activeTab,
    userId: '', // This is a placeholder, actual new task uses prop userId
  }];

  const focusTaskInput = useCallback((taskId: string) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const taskNameInput = document.querySelector(
          `input.task-input[data-task-id="${taskId}"]`
        ) as HTMLInputElement;

        if (taskNameInput) {
          if (document.activeElement !== taskNameInput) {
            taskNameInput.focus();
            taskNameInput.setSelectionRange(0, 0);
            lastTaskInputRef.current = taskNameInput;
            maintainFocusRef.current = true;
            
            const taskIndex = filteredTasks.findIndex(t => t.id === taskId);
            focusedTaskPositionRef.current = taskIndex;
          }
        }
      }, 10);
    });
  }, [filteredTasks]);

  const focusLastEmptyTask = useCallback(() => {
    for (let i = filteredTasks.length - 1; i >= 0; i--) {
      const task = filteredTasks[i];
      if (task.name === '' && task.id !== 'empty') {
        focusTaskInput(task.id);
        return true;
      }
    }
    
    if (filteredTasks.length === 1 && filteredTasks[0].name === '' && filteredTasks[0].id !== 'empty') {
      focusTaskInput(filteredTasks[0].id);
      return true;
    }
    
    return false;
  }, [filteredTasks, focusTaskInput]);

  useEffect(() => {
    if (maintainFocusRef.current && focusedTaskPositionRef.current >= 0) {
      const targetPosition = focusedTaskPositionRef.current;
      
      if (filteredTasks[targetPosition] && filteredTasks[targetPosition].id !== 'empty') {
        const taskId = filteredTasks[targetPosition].id;
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            const taskNameInput = document.querySelector(
              `input.task-input[data-task-id="${taskId}"]`
            ) as HTMLInputElement;

            if (taskNameInput && document.activeElement !== taskNameInput) {
              taskNameInput.focus();
              taskNameInput.setSelectionRange(0, 0);
              lastTaskInputRef.current = taskNameInput;
            }
          }, 5);
        });
      }
    }
  }, [filteredTasks]);

  useEffect(() => {
    if (shouldFocusNewTaskRef.current && focusAttemptCountRef.current < 3) {
      focusAttemptCountRef.current++;
      
      const focused = focusLastEmptyTask();
      
      if (focused) {
        shouldFocusNewTaskRef.current = false;
        focusAttemptCountRef.current = 0;
      } else if (focusAttemptCountRef.current >= 3) {
        shouldFocusNewTaskRef.current = false;
        focusAttemptCountRef.current = 0;
        maintainFocusRef.current = false;
      }
    }
  }, [filteredTasks, tasks, activeTab, focusLastEmptyTask]);

  useEffect(() => {
    shouldFocusNewTaskRef.current = false;
    focusAttemptCountRef.current = 0;
    maintainFocusRef.current = false;
    focusedTaskPositionRef.current = -1;
  }, [activeTab]);

  const parseTaskDate = (dateString: string | undefined | null): Date | undefined => {
    if (!dateString || dateString.trim() === '') return undefined;
    try {
      // Handle date-only format (YYYY-MM-DD) by adding time component
      const dateToParseString = dateString.includes('T') ? dateString : dateString + 'T00:00:00';
      const parsedDate = parseISO(dateToParseString);
      // Check if the parsed date is valid
      if (isNaN(parsedDate.getTime())) return undefined;
      return parsedDate;
    } catch (error) {
      return undefined;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const parsedDate = parseTaskDate(date);
    if (!parsedDate) return '';
    
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
    if (onAddTask && userId) {
      shouldFocusNewTaskRef.current = true;
      focusAttemptCountRef.current = 0;
      onAddTask({
        name: '',
        description: '',
        dueDate: '',
        completed: false,
        status: activeTab,
        userId,
      });
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    if (id === 'empty') {
      setEmptyTaskData(prev => ({
        name: typeof updates.name === 'string' ? updates.name : prev.name,
        description: typeof updates.description === 'string' ? updates.description : prev.description,
      }));
      // Do not call onUpdateTask for the placeholder
    } else if (onUpdateTask) {
      const currentFocusedTask = filteredTasks[focusedTaskPositionRef.current];
      if (currentFocusedTask && currentFocusedTask.id === id && updates.name && updates.name !== '') {
        maintainFocusRef.current = false;
        focusedTaskPositionRef.current = -1;
      }

      // Handle task completion
      if (updates.completed !== undefined) {
        const now = format(new Date(), 'yyyy-MM-dd');
        const updatedTask = {
          ...updates,
          status: updates.completed ? 'done' as const : 'todo' as const,
          completedAt: updates.completed ? now : undefined
        };
        onUpdateTask(id, updatedTask);
        
        if (updates.completed) {
          setShowCompletedAnimation(true);
          setTimeout(() => setShowCompletedAnimation(false), 1500);
        }
      } else {
        onUpdateTask(id, updates);
      }
    }
  };

  const deleteTask = (taskId: string) => {
    if (onDeleteTask) {
      // Store the index of the task being deleted
      const taskIndex = filteredTasks.findIndex(t => t.id === taskId);
      onDeleteTask(taskId);
      
      // After deletion, focus the previous task if it exists, but only within this component
      requestAnimationFrame(() => {
        // Use a more specific selector to avoid interfering with recurring tasks
        const taskInputs = document.querySelectorAll('.task-list-container .task-input[data-task-id]');
        const targetIndex = Math.min(taskIndex, taskInputs.length - 1);
        if (targetIndex >= 0) {
          (taskInputs[targetIndex] as HTMLInputElement)?.focus();
        }
      });
    }
  };

  const undoDelete = () => {
    // ... existing code ...
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (taskId === 'empty') {
        if (emptyTaskData.name.trim() !== '') {
          if (onAddTask && userId) {
            shouldFocusNewTaskRef.current = true;
            focusAttemptCountRef.current = 0;
            onAddTask({
              name: emptyTaskData.name.trim(),
              description: emptyTaskData.description.trim(),
              dueDate: '',
              completed: false,
              status: activeTab,
              userId,
            });
            setEmptyTaskData({ name: '', description: '' });
          }
        }
      } else {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.name.trim() !== '') {
          addNewTask();
        }
      }
    } else if (e.key === 'Backspace' && taskId !== 'empty') {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0) {
        const taskName = typeof task.name === 'string' ? task.name : '';
        const taskDescription = typeof task.description === 'string' ? task.description : '';
        if (taskName.trim() === '' && taskDescription.trim() === '') {
          deleteTask(taskId);
        }
      }
    }
  };

  const handleTouchStart = (e: TouchEvent, taskId: string) => {
    // ... existing code ...
  };

  const handleTouchMove = (e: TouchEvent) => {
    // ... existing code ...
  };

  const handleTouchEnd = () => {
    // ... existing code ...
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

  // Drag and Drop Handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: DragEvent<HTMLButtonElement>, targetStatus: Tab) => {
    e.preventDefault();
    if (targetStatus !== activeTab) {
      setDragOverTarget(targetStatus);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragOverTarget(null);
  };

  const handleDrop = (e: DragEvent<HTMLButtonElement>, targetStatus: Tab) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onUpdateTask) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updates: Partial<Task> = {
          status: targetStatus
        };
        
        // If dropping into done tab, mark as completed
        if (targetStatus === 'done') {
          updates.completed = true;
          updates.completedAt = format(new Date(), 'yyyy-MM-dd');
        } else if (task.status === 'done') {
          // If moving from done tab, mark as uncompleted
          updates.completed = false;
          updates.completedAt = undefined;
        }
        
        onUpdateTask(taskId, updates);
      }
    }
    setDragOverTarget(null);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverTarget(null);
  };

  // Empty task drag handlers
  const handleEmptyTaskDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleEmptyTaskDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleEmptyTaskDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onUpdateTask) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updates: Partial<Task> = {
          status: activeTab
        };
        
        // If dropping into done tab, mark as completed
        if (activeTab === 'done') {
          updates.completed = true;
          updates.completedAt = format(new Date(), 'yyyy-MM-dd');
        } else if (task.status === 'done') {
          // If moving from done tab, mark as uncompleted
          updates.completed = false;
          updates.completedAt = undefined;
        }
        
        onUpdateTask(taskId, updates);
      }
    }
  };

  // Load user preferences on mount
  useEffect(() => {
    async function loadUserPreferences() {
      try {
        const response = await fetch('/api/user-preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.tabNames) {
            setTabNames(data.tabNames);
          }
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    }
    loadUserPreferences();
  }, []);

  // Save tab names when they change
  const updateTabName = async (tab: Tab, newName: string) => {
    const updatedTabNames = { ...tabNames, [tab]: newName };
    setTabNames(updatedTabNames);
    setEditingTab(null);
    
    try {
      await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tabNames: updatedTabNames
        }),
      });
    } catch (error) {
      console.error('Failed to save tab name:', error);
    }
  };

  return (
    <div className="w-full flex items-start justify-center task-list-container">
      <div className="w-full max-w-2xl px-4 bg-task-light dark:bg-task-dark rounded-lg mb-4">
        <div className="pt-4 px-4">
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
                    updateTabName(tab, value);
                  }}
                  onDragOver={(e) => handleDragOver(e, tab)}
                  onDrop={(e) => handleDrop(e, tab)}
                  onDragLeave={handleDragLeave}
                  className={cn({
                    'bg-accent dark:bg-sidebar-accent': dragOverTarget === tab
                  })}
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
        
        <div className="space-y-2 p-4">
          {displayTasks.map(task => (
            <div
              key={task.id}
              className="relative group"
              draggable={activeTab !== 'done' && task.id !== 'empty'}
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragEnd={handleDragEnd}
              onDragOver={task.id === 'empty' ? handleEmptyTaskDragOver : undefined}
              onDragLeave={task.id === 'empty' ? handleEmptyTaskDragLeave : undefined}
              onDrop={task.id === 'empty' ? handleEmptyTaskDrop : undefined}
              onTouchStart={(e) => handleTouchStart(e, task.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ opacity: taskToDelete === task.id ? (1 - swipeDistance / 100) : 1 }}
            >
              {taskToDelete === task.id && swipeDistance > 10 && (
                 <div className="absolute inset-y-0 right-0 flex items-center justify-end bg-red-500 text-white text-xs px-2 rounded-r-lg pointer-events-none" style={{ width: `${swipeDistance}%`, maxWidth: '100px' }}>
                   Delete
                 </div>
              )}
              <div
                className={cn(
                  "bg-task-light dark:bg-task-dark rounded-lg p-2 transition-transform flex items-start gap-2",
                  { "transform -translate-x-full": taskToDelete === task.id && swipeDistance >= 100 }
                )}
                style={{ transform: taskToDelete === task.id ? `translateX(-${swipeDistance}px)` : 'none' }}
              >
                {activeTab === 'done' ? (
                  <div className="mt-1 text-foreground flex">
                    <Check className="size-3" />
                    <Check className="size-3 -ml-2" />
                  </div>
                ) : (
                  <button 
                    className="mt-1 text-foreground hover:text-foreground transition-colors"
                    onClick={() => updateTask(task.id, { completed: !task.completed })}
                  >
                    <Check className="size-3" />
                  </button>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="text"
                        value={typeof task.name === 'string' ? task.name : ''}
                        onChange={(e) => updateTask(task.id, { name: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, task.id)}
                        className="flex-1 bg-transparent text-xs font-medium focus:outline-none task-input"
                        data-task-id={task.id}
                        placeholder={task.id === 'empty' ? "Task Name" : "Task name"}
                      />
                      <input
                        type="text"
                        value={typeof task.description === 'string' ? task.description : ''}
                        onChange={(e) => updateTask(task.id, { description: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, task.id)}
                        className="flex-1 bg-transparent text-xs text-muted-foreground focus:outline-none task-input"
                        placeholder="Description"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px] flex justify-end">
                        {(activeTab as Tab) === 'done' ? (
                          task.completedAt ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground task-calendar-date">
                                  {formatDate(task.completedAt)}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-0 rounded-none task-calendar" align="end">
                                <CustomCalendar
                                  selectedDate={parseTaskDate(task.completedAt)}
                                  onDateSelect={(date) => {
                                    if (date) {
                                      updateTask(task.id, { completedAt: format(date, 'yyyy-MM-dd') });
                                    }
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground task-calendar-date flex justify-center">
                                  <Calendar className="size-3" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-0 rounded-none task-calendar" align="end">
                                <CustomCalendar
                                  selectedDate={undefined}
                                  onDateSelect={(date) => {
                                    if (date) {
                                      updateTask(task.id, { completedAt: format(date, 'yyyy-MM-dd') });
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
                                selectedDate={parseTaskDate(task.dueDate)}
                                onDateSelect={(date) => {
                                  updateTask(task.id, { dueDate: date ? format(date, 'yyyy-MM-dd') : '' });
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-muted-foreground hover:text-foreground task-calendar-date flex justify-center">
                                <Calendar className="size-3" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-0 rounded-none task-calendar" align="end">
                              <CustomCalendar
                                selectedDate={parseTaskDate(task.dueDate)}
                                onDateSelect={(date) => {
                                  updateTask(task.id, { dueDate: date ? format(date, 'yyyy-MM-dd') : '' });
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabButton(props: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  onDoubleClick?: () => void;
  isEditing?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  onDragOver?: (e: DragEvent<HTMLButtonElement>) => void;
  onDrop?: (e: DragEvent<HTMLButtonElement>) => void;
  onDragLeave?: (e: DragEvent<HTMLButtonElement>) => void;
}) {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const { 
    children, 
    active, 
    onClick,
    onDoubleClick,
    isEditing,
    value,
    onChange,
    className,
    onDragOver, 
    onDrop, 
    onDragLeave 
  } = props;

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
        "px-2 py-1 text-xs transition-colors task-tab rounded-md",
        active 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      {children}
    </button>
  );
} 