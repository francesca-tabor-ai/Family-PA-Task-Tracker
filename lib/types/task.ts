// Task Data Model
// Structured task object with all required and optional fields

export type TaskStatus = 
  | 'inbox'        // New task, not yet processed
  | 'waiting'      // Blocked, waiting on something
  | 'scheduled'    // Has a scheduled date/time
  | 'in_progress'  // Actively being worked on
  | 'completed'    // Finished
  | 'delegated';    // Assigned to someone else

export type TaskSource = 
  | 'manual'  // Created via UI
  | 'voice'   // Created via WhatsApp voice
  | 'api';    // Created programmatically

export interface Task {
  id: string;                    // UUID
  title: string;                  // Required
  description?: string;          // Optional
  status: TaskStatus;
  categories: string[];          // Array of category paths
  people: string[];               // Array of person/user IDs
  dueDate: string | null;         // ISO 8601 date string
  scheduledFor: string | null;    // ISO 8601 date string
  highRisk: boolean;             // Default false
  source: TaskSource;
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;              // ISO 8601 timestamp
  
  // Legacy/DB fields (for compatibility)
  family_id?: string;
  assignee_user_id?: string | null;
  created_by_user_id?: string;
  source_media_url?: string | null;
  confidence?: number | null;
}

// Helper type for creating a new task (omits auto-generated fields)
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;  // Optional, will be generated if not provided
};

// Helper type for updating a task (all fields optional except id)
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>> & {
  id: string;
};

// Helper function to map old status to new status
export function mapLegacyStatus(oldStatus: string): TaskStatus {
  switch (oldStatus) {
    case 'open':
      return 'inbox';
    case 'done':
      return 'completed';
    case 'in_progress':
      return 'in_progress';
    case 'canceled':
      return 'delegated';
    default:
      return 'inbox';
  }
}

// Helper function to map old source_type to new source
export function mapLegacySource(oldSource: string | null | undefined): TaskSource {
  switch (oldSource) {
    case 'whatsapp':
      return 'voice';
    case 'manual':
      return 'manual';
    case 'import':
      return 'api';
    default:
      return 'manual';
  }
}

