import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, Comment, ActivityLog } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private tasksSubject = new BehaviorSubject<Task[]>(this.getMockTasks());
  public tasks$ = this.tasksSubject.asObservable();

  constructor() { }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  addTask(task: Task): void {
    const currentTasks = this.tasksSubject.value;
    task.activityLog = [{
      id: this.generateId(),
      message: 'Task created',
      timestamp: new Date(),
      details: `Task created by ${task.assignee}`,
      created_at: new Date() // ✅ Added created_at
    }];
    this.tasksSubject.next([...currentTasks, task]);
  }

  updateTask(updatedTask: Task): void {
    const currentTasks = this.tasksSubject.value;
    const index = currentTasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      currentTasks[index] = updatedTask;
      this.tasksSubject.next([...currentTasks]);
    }
  }

  deleteTask(taskId: number): void {
    const currentTasks = this.tasksSubject.value;
    this.tasksSubject.next(currentTasks.filter(t => t.id !== taskId));
  }

  updateTaskStatus(taskId: number, newStatus: Task['status']): void {
    const currentTasks = this.tasksSubject.value;
    const task = currentTasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      task.activityLog?.push({
        id: this.generateId(),
        message: 'Status changed',
        timestamp: new Date(),
        details: `Status changed to ${newStatus}`,
        created_at: new Date() // ✅ Added created_at
      });
      this.updateTask(task);
    }
  }

  likeTask(taskId: number): void {
    const currentTasks = this.tasksSubject.value;
    const task = currentTasks.find(t => t.id === taskId);
    if (task) {
      task.likes = (task.likes || 0) + 1;
      task.activityLog?.push({
        id: this.generateId(),
        message: 'Task liked',
        timestamp: new Date(),
        details: 'Task received a like',
        created_at: new Date() // ✅ Added created_at
      });
      this.updateTask(task);
    }
  }

  addComment(taskId: number, commentText: string, author: string): void {
    const currentTasks = this.tasksSubject.value;
    const task = currentTasks.find(t => t.id === taskId);
    if (task) {
      const comment: Comment = {
        id: this.generateId(),
        author: author,
        text: commentText,
        created_at: new Date()
      };
      task.comments?.push(comment);
      task.activityLog?.push({
        id: this.generateId(),
        message: 'Comment added',
        timestamp: new Date(),
        details: `${author} added a comment`,
        created_at: new Date() // ✅ Added created_at
      });
      this.updateTask(task);
    }
  }

  generateId(): number {
    return Math.floor(Math.random() * 100000);
  }

  private getMockTasks(): Task[] {
    return [
      {
        id: 1,
        title: 'Setup Project Repository',
        description: 'Initialize Git repository and setup project structure',
        status: 'done',
        assignee: 'John Doe',
        priority: 'high',
        likes: 5,
        comments: [],
        created_at: new Date('2024-01-15'),
        activityLog: [
          {
            id: 1,
            message: 'Task created',
            timestamp: new Date('2024-01-15'),
            details: 'Task created by John Doe',
            created_at: new Date('2024-01-15') // ✅ Added created_at
          }
        ]
      },
      {
        id: 2,
        title: 'Design User Interface',
        description: 'Create mockups and design system for the application',
        status: 'inProgress',
        assignee: 'Jane Smith',
        priority: 'medium',
        likes: 3,
        comments: [],
        created_at: new Date('2024-01-16'),
        activityLog: [
          {
            id: 2,
            message: 'Task created',
            timestamp: new Date('2024-01-16'),
            details: 'Task created by Jane Smith',
            created_at: new Date('2024-01-16') // ✅ Added created_at
          }
        ]
      },
      {
        id: 3,
        title: 'Implement Authentication',
        description: 'Add user login and registration functionality',
        status: 'backlog',
        assignee: 'Mike Johnson',
        priority: 'high',
        likes: 1,
        comments: [],
        created_at: new Date('2024-01-17'),
        activityLog: [
          {
            id: 3,
            message: 'Task created',
            timestamp: new Date('2024-01-17'),
            details: 'Task created by Mike Johnson',
            created_at: new Date('2024-01-17') // ✅ Added created_at
          }
        ]
      }
    ];
  }
}
