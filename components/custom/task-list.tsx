'use client';

import { format, parseISO, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Check, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import React from 'react';
import { useState, useRef, KeyboardEvent, TouchEvent, useEffect, DragEvent } from 'react';

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
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [tabNames, setTabNames] = useState({
    todo: 'ToDo',
    watch: 'Watch',
    later: 'Later',
    done: 'Completed'
  });
  const [dragOverTarget, setDragOverTarget] = useState<Tab | null>(null);

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
      
      const originalStatus = task.status;

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

        const originalTabTasks = prevTasks.filter(t => t.status === originalStatus);
        if (originalTabTasks.length === 1 && originalStatus !== 'done') {
          // Add a new empty task immediately
          updatedTasks.push({
            id: Date.now().toString(),
            name: '',
            description: '',
            dueDate: '',
            completed: false,
            status: originalStatus,
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

      if (updates.status && updates.status !== originalStatus && updates.status !== 'done') {
        if (!task.name.trim() && !task.description.trim() && !task.dueDate.trim() && !task.id.startsWith('default-')) {
          console.warn("Attempted to move an empty non-default task. Ignoring.");
          return prevTasks;
        }

        let updatedTasks = prevTasks.map(t =>
          t.id === id ? { ...t, ...updates } : t
        );

        const remainingTasksInOriginalTab = prevTasks.filter(
            t => t.status === originalStatus && t.id !== id
        );

        if (remainingTasksInOriginalTab.length === 0 && originalStatus !== 'done') {
          // Add a new empty task immediately
          updatedTasks.push({
            id: Date.now().toString(),
            name: '',
            description: '',
            dueDate: '',
            completed: false,
            status: originalStatus,
          });
        }
        return updatedTasks;
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
      const currentTaskValue = e.currentTarget.value;

      // Check if we are editing a placeholder task
      if (taskId.startsWith('default-')) {
        // Only proceed if the placeholder has some text
        if (currentTaskValue.trim() !== '') {
          // Update the placeholder to become a real task
          updateTask(taskId, { 
            name: currentTaskValue, 
            id: Date.now().toString() // Assign a new ID
          });
          // Add a new empty placeholder below the one just filled
          addNewTask(); 
        } 
        // If Enter is pressed on an empty placeholder, do nothing.
      } else {
        // For non-placeholder tasks:
        // Find the current task to check if it's empty
        const currentTask = tasks.find(t => t.id === taskId);
        // Only add a new task if the current one isn't empty
        if (currentTask && (currentTask.name.trim() !== '' || currentTask.description.trim() !== '')) {
            addNewTask();
        }
        // If the current task is empty, do nothing on Enter.
      }
    } else if (e.key === 'Backspace' && e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0) {
      // Check if the input is empty before allowing deletion
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.name.trim() && !task.description.trim()) {
        // Allow deleting empty tasks, but handle placeholder logic carefully
        const tasksInThisTab = tasks.filter(t => t.status === task.status);
        // Prevent deleting the *last* task in a tab (which should be the placeholder)
        if (tasksInThisTab.length <= 1) {
          return; // Don't delete the last placeholder via backspace
        }

        e.preventDefault();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > 0) {
          // Focus the previous task after deletion
          const prevTask = tasks[taskIndex - 1];
          // Ensure the previous task is in the same tab before setting focus ref
          if (prevTask && prevTask.status === task.status) { 
              lastTaskRef.current = prevTask.id;
          }
        }
        deleteTask(taskId);
        setTimeout(focusLastTask, 0);
      }
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

  // Drag and Drop Handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: DragEvent<HTMLButtonElement>, targetStatus: Tab) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget(targetStatus); // Set target for visual feedback
  };

  const handleDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    setDragOverTarget(null); // Clear visual feedback when leaving droppable area
  };

  const handleDrop = (e: DragEvent<HTMLButtonElement>, targetStatus: Tab) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setDragOverTarget(null); // Clear visual feedback immediately
    setDraggingTaskId(null); // Clear dragging task ID immediately

    if (taskId) {
      // Find the task being dragged to know its original status
      const draggedTask = tasks.find(t => t.id === taskId);
      if (draggedTask) {
        const originalStatus = draggedTask.status;

        // Check if there's an empty task in the target list
        const emptyTaskInTarget = tasks.find(t => 
          t.status === targetStatus && 
          !t.name.trim() && 
          !t.description.trim() && 
          !t.dueDate.trim()
        );

        if (emptyTaskInTarget) {
          // Fill the empty task with the dragged task's content
          updateTask(emptyTaskInTarget.id, {
            name: draggedTask.name,
            description: draggedTask.description,
            dueDate: draggedTask.dueDate,
            completed: draggedTask.completed
          });
          
          // Delete the original dragged task
          setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        } else {
          // If no empty task exists, update the task's status as before
          updateTask(taskId, { status: targetStatus });
        }

        // If the user dropped the task onto a *different* tab 
        // AND the tab they dragged *from* is the currently active one,
        // focus the new placeholder in that original tab.
        if (originalStatus !== targetStatus && activeTab === originalStatus) {
          setTimeout(() => {
            // Find the newly added empty task
            const newEmptyTask = tasks.find(t => t.status === originalStatus && !t.name && !t.description);
            if (newEmptyTask) {
              const input = document.querySelector(`input[data-task-id="${newEmptyTask.id}"]`) as HTMLInputElement;
              if (input) input.focus();
            }
          }, 0);
        }
      }
    }
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  return (
    <div className="w-full flex items-start justify-center">
      <div className="w-full max-w-2xl px-4 bg-task-light dark:bg-task-dark rounded-lg">
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
                    setTabNames(prev => ({ ...prev, [tab]: value }));
                    setEditingTab(null);
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
        
        <div className="space-y-2 py-4 px-4">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="relative group"
              draggable={activeTab !== 'done'}
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragEnd={handleDragEnd}
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