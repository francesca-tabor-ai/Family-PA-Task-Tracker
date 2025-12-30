// Task Filter Utilities
// Derived views/filters - not stored in database

import type { Task, TaskStatus } from '@/lib/types/task';

export type ViewType = 
  | 'all'
  | 'today'
  | 'upcoming'
  | 'pending'
  | 'high-risk'
  | 'expiring-soon'
  | 'person';

export interface ViewFilter {
  type: ViewType;
  personId?: string; // For per-person view
  daysAhead?: number; // For upcoming view (default: 7)
}

/**
 * Check if a date is today
 */
function isToday(date: string | null): boolean {
  if (!date) return false;
  const taskDate = new Date(date);
  const today = new Date();
  return (
    taskDate.getFullYear() === today.getFullYear() &&
    taskDate.getMonth() === today.getMonth() &&
    taskDate.getDate() === today.getDate()
  );
}

/**
 * Check if a date is within the next N days
 */
function isWithinDays(date: string | null, days: number): boolean {
  if (!date) return false;
  const taskDate = new Date(date);
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  return taskDate >= today && taskDate <= futureDate;
}

/**
 * Check if a date is "soon" (within next 30 days)
 */
function isSoon(date: string | null): boolean {
  return isWithinDays(date, 30);
}

/**
 * Filter tasks based on view type
 */
export function filterTasksByView(tasks: Task[], filter: ViewFilter): Task[] {
  const { type, personId, daysAhead = 7 } = filter;

  switch (type) {
    case 'all':
      return tasks;

    case 'today':
      return tasks.filter(task => 
        (task.dueDate && isToday(task.dueDate)) ||
        (task.scheduledFor && isToday(task.scheduledFor))
      );

    case 'upcoming':
      return tasks.filter(task => 
        (task.dueDate && isWithinDays(task.dueDate, daysAhead)) ||
        (task.scheduledFor && isWithinDays(task.scheduledFor, daysAhead))
      );

    case 'pending':
      return tasks.filter(task => 
        ['waiting', 'scheduled', 'delegated'].includes(task.status)
      );

    case 'high-risk':
      return tasks.filter(task => task.highRisk === true);

    case 'expiring-soon':
      return tasks.filter(task => {
        const hasExpiryCategory = task.categories?.some(cat => 
          cat.includes('Expiry & Renewals')
        );
        const dueSoon = task.dueDate && isSoon(task.dueDate);
        return hasExpiryCategory && dueSoon;
      });

    case 'person':
      if (!personId) return [];
      return tasks.filter(task => 
        task.people?.includes(personId)
      );

    default:
      return tasks;
  }
}

/**
 * Get view title
 */
export function getViewTitle(filter: ViewFilter): string {
  switch (filter.type) {
    case 'all':
      return 'All Tasks';
    case 'today':
      return 'Today';
    case 'upcoming':
      return `Upcoming (${filter.daysAhead || 7} days)`;
    case 'pending':
      return 'Pending';
    case 'high-risk':
      return 'High Risk';
    case 'expiring-soon':
      return 'Expiring Soon';
    case 'person':
      return 'Per Person';
    default:
      return 'Tasks';
  }
}

/**
 * Get view description
 */
export function getViewDescription(filter: ViewFilter): string {
  switch (filter.type) {
    case 'all':
      return 'All tasks across all statuses';
    case 'today':
      return 'Tasks due or scheduled for today';
    case 'upcoming':
      return `Tasks due or scheduled within the next ${filter.daysAhead || 7} days`;
    case 'pending':
      return 'Tasks waiting, scheduled, or delegated';
    case 'high-risk':
      return 'Time-sensitive or high-priority tasks';
    case 'expiring-soon':
      return 'Expiry & Renewals items due within 30 days';
    case 'person':
      return 'Tasks assigned to a specific person';
    default:
      return '';
  }
}

