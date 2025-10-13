export interface Comment {
  id: number;
  author: string;
  text: string;
  created_at: Date;
}

export interface ActivityLog {
  id: number;
  message: string;
  timestamp: Date;
  details?: string;
  created_at: Date; // ✅ added properly for logs
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  assignee?: string;
  status: 'backlog' | 'inProgress' | 'done' | 'live';
  likes?: number;
  comments: Comment[]; // ✅ non-optional to avoid template errors
  activityLog: ActivityLog[];
  created_at: Date;
  priority: 'low' | 'medium' | 'high';
}
