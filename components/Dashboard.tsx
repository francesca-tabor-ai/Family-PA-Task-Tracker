"use client";

import { useState, useEffect, useMemo } from "react";
import TaskList from "./TaskList";
import ViewSelector from "./ViewSelector";
import { filterTasksByView, getViewTitle, getViewDescription, type ViewFilter } from "@/lib/utils/task-filters";
import type { Task } from "@/lib/types/task";
import type { Person } from "@/lib/types/person";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [currentView, setCurrentView] = useState<ViewFilter>({ type: 'all' });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks
  useEffect(() => {
    fetchTasks();
    fetchPeople();
  }, []);

  async function fetchTasks() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchPeople() {
    try {
      const response = await fetch('/api/people');
      if (response.ok) {
        const data = await response.json();
        setPeople(data);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  }

  // Filter tasks based on current view
  const filteredTasks = useMemo(() => {
    return filterTasksByView(tasks, currentView);
  }, [tasks, currentView]);

  // Handle task updates (from TaskList)
  function handleTaskUpdate(updatedTask: Task) {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }

  // Handle new task creation (from TaskList)
  function handleTaskCreate(newTask: Task) {
    setTasks(prev => [newTask, ...prev]);
  }

  if (isLoading) {
    return (
      <div className="card">
        <p className="text-sm font-rubik text-brand-text/60">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <section className="card">
        <ViewSelector
          currentView={currentView}
          onViewChange={setCurrentView}
          people={people}
        />
      </section>

      {/* View Info */}
      <section className="card">
        <h3 className="text-heading-3 text-brand-text mb-2">
          {getViewTitle(currentView)}
        </h3>
        <p className="text-sm font-rubik text-brand-text/70 font-light mb-4">
          {getViewDescription(currentView)}
        </p>
        <p className="text-xs font-rubik text-brand-text/60">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>
      </section>

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskCreate={handleTaskCreate}
      />
    </div>
  );
}

