"use client";

import { useMemo, useState, useEffect } from "react";
import AddTaskForm from "./AddTaskForm";
import TaskDetails from "./TaskDetails";
import type { Task, TaskStatus } from "@/lib/types/task";

interface TaskListProps {
  tasks?: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskCreate?: (task: Task) => void;
}

export default function TaskList({ tasks: propTasks, onTaskUpdate, onTaskCreate }: TaskListProps = {}) {
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Use prop tasks if provided, otherwise use local state
  const tasks = propTasks || localTasks;
  const setTasks = propTasks ? (() => {}) : setLocalTasks;

  // Fetch tasks if not provided via props
  useEffect(() => {
    if (!propTasks) {
      fetchTasks();
    }
  }, [propTasks]);

  async function fetchTasks() {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setLocalTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

  // Filter tasks by status
  const inboxTasks = useMemo(() => tasks.filter(t => t.status === "inbox"), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter(t => t.status === "in_progress"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === "completed"), [tasks]);

  async function addTask(title: string) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, status: 'inbox' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask: Task = await response.json();
      
      if (propTasks) {
        // If tasks come from props, notify parent
        onTaskCreate?.(newTask);
      } else {
        // Otherwise update local state
        setTasks(prev => [newTask, ...prev]);
      }
      
      setNewTaskIds(prev => new Set([...prev, newTask.id]));
      
      // Remove highlight after animation
      setTimeout(() => {
        setNewTaskIds(prev => {
          const next = new Set(prev);
          next.delete(newTask.id);
          return next;
        });
      }, 1500);
    } catch (error) {
      console.error('Error adding task:', error);
      // Fallback to local state if API fails
      const t: Task = { 
        id: crypto.randomUUID(), 
        title, 
        status: "inbox",
        categories: [],
        people: [],
        dueDate: null,
        scheduledFor: null,
        highRisk: false,
        source: "manual",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks(prev => [t, ...prev]);
    }
  }

  async function toggleStatus(id: string, currentStatus: TaskStatus, e?: React.MouseEvent) {
    // Prevent opening details panel when clicking checkbox
    e?.stopPropagation();
    
    const newStatus: TaskStatus = currentStatus === "inbox" || currentStatus === "in_progress" 
      ? "completed" 
      : "inbox";

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask: Task = await response.json();
      
      if (propTasks) {
        // If tasks come from props, notify parent
        onTaskUpdate?.(updatedTask);
      } else {
        // Otherwise update local state
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      }
      
      // Update selected task if it's the one being toggled
      if (selectedTask?.id === id) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Fallback to local state if API fails
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
      );
    }
  }

  function handleTaskClick(task: Task) {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  }

  function handleTaskSave(updatedTask: Task) {
    if (propTasks) {
      // If tasks come from props, notify parent
      onTaskUpdate?.(updatedTask);
    } else {
      // Otherwise update local state
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }
    setSelectedTask(updatedTask);
  }

  function handleDetailsClose() {
    setIsDetailsOpen(false);
    // Keep selectedTask for smooth transitions, clear it after a delay
    setTimeout(() => setSelectedTask(null), 300);
  }

  return (
    <div className="space-y-6">
      <AddTaskForm onAdd={addTask} />

      <section className="card card-elevated">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-heading-3 text-brand-text">Inbox</h3>
          <span className="text-sm font-rubik text-brand-text/60 font-medium">({inboxTasks.length})</span>
        </div>
        <ul className="space-y-2">
          {inboxTasks.map((t, index) => (
            <li 
              key={t.id} 
              className={`task-item flex items-center gap-4 rounded-button border border-brand-button-light bg-white p-4 animate-fade-in cursor-pointer hover:shadow-card transition-all ${
                newTaskIds.has(t.id) ? "task-item-new" : ""
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleTaskClick(t)}
            >
              <button
                onClick={(e) => toggleStatus(t.id, t.status, e)}
                className="checkbox-custom flex-shrink-0"
                aria-label={`Mark "${t.title}" as completed`}
                type="button"
              >
                <svg 
                  className="w-4 h-4 text-white transition-opacity duration-200" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <div className="flex-1">
                <span className="text-base font-rubik text-brand-text font-normal">{t.title}</span>
                {t.description && (
                  <p className="text-sm font-rubik text-brand-text/60 font-light mt-1">{t.description}</p>
                )}
              </div>
            </li>
          ))}
          {inboxTasks.length === 0 && (
            <div className="empty-state">
              <p className="empty-state-text text-base">
                No tasks in inbox—nice work 🎉
              </p>
              <p className="empty-state-text text-sm mt-2">
                Voice-captured tasks will appear here.
              </p>
            </div>
          )}
        </ul>
      </section>

      {inProgressTasks.length > 0 && (
        <section className="card">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-heading-3 text-brand-text">In Progress</h3>
            <span className="text-sm font-rubik text-brand-text/60 font-medium">({inProgressTasks.length})</span>
          </div>
          <ul className="space-y-2">
            {inProgressTasks.map((t, index) => (
              <li 
                key={t.id} 
                className="task-item flex items-center gap-4 rounded-button border border-brand-button-light bg-white p-4 animate-fade-in cursor-pointer hover:shadow-card transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleTaskClick(t)}
              >
                <button
                  onClick={(e) => toggleStatus(t.id, t.status, e)}
                  className="checkbox-custom flex-shrink-0"
                  aria-label={`Mark "${t.title}" as completed`}
                  type="button"
                >
                  <svg 
                    className="w-4 h-4 text-white transition-opacity duration-200" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <div className="flex-1">
                  <span className="text-base font-rubik text-brand-text font-normal">{t.title}</span>
                  {t.description && (
                    <p className="text-sm font-rubik text-brand-text/60 font-light mt-1">{t.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {completedTasks.length > 0 && (
        <section className="card">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-heading-3 text-brand-text">Completed</h3>
            <span className="text-sm font-rubik text-brand-text/60 font-medium">({completedTasks.length})</span>
          </div>
          <ul className="space-y-2">
            {completedTasks.map((t, index) => (
              <li 
                key={t.id} 
                className="task-item flex items-center gap-4 rounded-button border border-brand-button-light bg-white/50 p-4 animate-fade-in cursor-pointer hover:shadow-card transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleTaskClick(t)}
              >
                <button
                  onClick={(e) => toggleStatus(t.id, t.status, e)}
                  className="checkbox-custom checked flex-shrink-0"
                  aria-label={`Reopen "${t.title}"`}
                  type="button"
                >
                  <svg 
                    className="w-4 h-4 text-white transition-opacity duration-200" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <div className="flex-1">
                  <span className="text-base font-rubik text-brand-text/50 line-through font-light">{t.title}</span>
                  {t.description && (
                    <p className="text-sm font-rubik text-brand-text/40 font-light mt-1 line-through">{t.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Task Details Drawer */}
      <TaskDetails
        task={selectedTask}
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
        onSave={handleTaskSave}
      />
    </div>
  );
}

