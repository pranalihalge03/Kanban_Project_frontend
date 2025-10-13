import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  likes: number;
  comments: number;
  date: string;
}

interface Tasks {
  backlog: Task[];
  inProgress: Task[];
  review: Task[];
  done: Task[];
}

type ColumnId = keyof Tasks;

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="kanban-board">
      <!-- Header -->
      <div class="board-header">
        <h1>Kanban Board</h1>
        
        <!-- Page Navigation -->
        <div class="header-actions">
          <button
            (click)="setCurrentPage(1)"
            [class]="currentPage === 1 ? 'btn btn-primary' : 'btn btn-secondary'"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            This Week
          </button>
          <button
            (click)="setCurrentPage(2)"
            [class]="currentPage === 2 ? 'btn btn-primary' : 'btn btn-secondary'"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            All Tasks
          </button>
          
          <!-- Action Buttons - Only on Page 2 -->
          <ng-container *ngIf="currentPage === 2">
            <button class="btn btn-primary" (click)="openAddTaskModal()">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Task
            </button>
            <button class="btn btn-success" (click)="generateWithAI()">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
              Generate with AI
            </button>
          </ng-container>
        </div>
      </div>

      <!-- Kanban Columns -->
      <div class="board-columns">
        <div *ngFor="let column of columns" class="column">
          <!-- Column Header -->
          <div [class]="column.headerClass">
            <h3>{{ column.title }}</h3>
            <span class="task-count">{{ getColumnCount(column.id) }}</span>
          </div>

          <!-- Task Cards -->
          <div class="column-content">
            <div
              *ngFor="let task of getColumnTasks(column.id)"
              class="task-card"
              (click)="openTaskDetails(task)"
            >
              <div class="task-header">
                <h4>{{ task.title }}</h4>
              </div>
              <p class="task-description">{{ task.description }}</p>
              
              <div class="task-footer">
                <!-- Assignee Avatar -->
                <div class="assignee" [style.background-color]="getAssigneeColor(task.assignee)">
                  {{ task.assignee }}
                </div>
                
                <!-- Task Meta -->
                <div class="task-meta">
                  <span>❤️ {{ task.likes }}</span>
                  <span>💬 {{ task.comments }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Task Modal -->
      <div class="modal-overlay" *ngIf="showAddTaskModal" (click)="closeAddTaskModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Add New Task</h2>
          
          <div class="form-group">
            <label>Title</label>
            <input type="text" [(ngModel)]="newTask.title" placeholder="Enter task title">
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="newTask.description" placeholder="Enter task description"></textarea>
          </div>

          <div class="form-group">
            <label>Assignee</label>
            <input type="text" [(ngModel)]="newTask.assignee" placeholder="Enter assignee initial" maxlength="1">
          </div>

          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="newTask.status">
              <option value="backlog">Backlog</option>
              <option value="inProgress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="newTask.date">
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="closeAddTaskModal()">Cancel</button>
            <button class="btn btn-primary" (click)="addTask()">Add Task</button>
          </div>
        </div>
      </div>

      <!-- Task Details Modal -->
      <div class="modal-overlay" *ngIf="showTaskDetailsModal" (click)="closeTaskDetails()">
        <div class="modal modal-large" (click)="$event.stopPropagation()">
          <div class="task-detail-header">
            <h2>{{ selectedTask?.title }}</h2>
            <button class="btn btn-danger" (click)="deleteTask()">Delete</button>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <p>{{ selectedTask?.description }}</p>
          </div>

          <div class="form-group">
            <label>Assignee</label>
            <div class="assignee" [style.background-color]="getAssigneeColor(selectedTask?.assignee || '')">
              {{ selectedTask?.assignee }}
            </div>
          </div>

          <div class="form-group">
            <label>Date</label>
            <p>{{ selectedTask?.date }}</p>
          </div>

          <div class="task-meta">
            <span>❤️ {{ selectedTask?.likes }}</span>
            <span>💬 {{ selectedTask?.comments }}</span>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="closeTaskDetails()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./board.scss']
})
export class BoardComponent {
  currentPage = 1;
  showAddTaskModal = false;
  showTaskDetailsModal = false;
  selectedTask: Task | null = null;
  
  newTask = {
    title: '',
    description: '',
    assignee: '',
    status: 'backlog' as ColumnId,
    date: new Date().toISOString().split('T')[0]
  };
  
  tasks: Tasks = {
    backlog: [
      { id: 1, title: 'New Task', description: 'string', assignee: 's', likes: 0, comments: 0, date: '2025-10-08' },
      { id: 2, title: 'New Task', description: 'string', assignee: 's', likes: 0, comments: 0, date: '2025-10-09' },
      { id: 3, title: 'New Task', description: 'string', assignee: 's', likes: 0, comments: 0, date: '2025-09-15' }
    ],
    inProgress: [
      { id: 4, title: 'python', description: 'python worki\nbbbbbbbbbbbbbbbbbb', assignee: 'p', likes: 0, comments: 0, date: '2025-10-10' }
    ],
    review: [
      { id: 5, title: 'AI agents', description: 'ai agents working', assignee: 'k', likes: 0, comments: 0, date: '2025-10-11' }
    ],
    done: [
      { id: 6, title: 'java', description: 'java programming', assignee: 'n', likes: 0, comments: 0, date: '2025-10-07' }
    ]
  };

  columns: Array<{id: ColumnId, title: string, headerClass: string, colorClass: string}> = [
  { id: 'backlog', title: 'Backlog', headerClass: 'column-header', colorClass: 'color-rose' },
  { id: 'inProgress', title: 'In Progress', headerClass: 'column-header', colorClass: 'color-blue' },
  { id: 'review', title: 'Review', headerClass: 'column-header', colorClass: 'color-emerald' },
  { id: 'done', title: 'Done', headerClass: 'column-header', colorClass: 'color-violet' }
];

  setCurrentPage(page: number): void {
    this.currentPage = page;
  }

  openAddTaskModal(): void {
    this.showAddTaskModal = true;
    this.resetNewTask();
  }

  closeAddTaskModal(): void {
    this.showAddTaskModal = false;
    this.resetNewTask();
  }

  resetNewTask(): void {
    this.newTask = {
      title: '',
      description: '',
      assignee: '',
      status: 'backlog',
      date: new Date().toISOString().split('T')[0]
    };
  }

 addTask(): void {
  if (!this.newTask.title || !this.newTask.assignee) {
    alert('Please fill in all required fields!');
    return;
  }

  const task: Task = {
    id: Date.now(),
    title: this.newTask.title,
    description: this.newTask.description,
    assignee: this.newTask.assignee.trim(), // full name allowed
    likes: 0,
    comments: 0,
    date: this.newTask.date
  };

  this.tasks.backlog.push(task); // 👈 always goes to backlog
  this.closeAddTaskModal();
}
  openTaskDetails(task: Task): void {
    this.selectedTask = task;
    this.showTaskDetailsModal = true;
  }

  closeTaskDetails(): void {
    this.showTaskDetailsModal = false;
    this.selectedTask = null;
  }

  deleteTask(): void {
    if (!this.selectedTask) return;
    
    const confirmed = confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    for (const columnId in this.tasks) {
      const column = this.tasks[columnId as ColumnId];
      const index = column.findIndex(t => t.id === this.selectedTask!.id);
      if (index > -1) {
        column.splice(index, 1);
        break;
      }
    }
    
    this.closeTaskDetails();
  }

  generateWithAI(): void {
    alert('AI Generation feature coming soon! 🤖✨');
  }

  getCurrentWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { start: startOfWeek, end: endOfWeek };
  }

  isCurrentWeek(dateStr: string): boolean {
    if (!dateStr) return false;
    const taskDate = new Date(dateStr);
    const { start, end } = this.getCurrentWeekRange();
    return taskDate >= start && taskDate <= end;
  }

  getFilteredTasks(): Tasks {
    if (this.currentPage === 1) {
      return {
        backlog: this.tasks.backlog.filter(task => this.isCurrentWeek(task.date)),
        inProgress: this.tasks.inProgress.filter(task => this.isCurrentWeek(task.date)),
        review: this.tasks.review.filter(task => this.isCurrentWeek(task.date)),
        done: this.tasks.done.filter(task => this.isCurrentWeek(task.date))
      };
    }
    return this.tasks;
  }

  getColumnTasks(columnId: ColumnId): Task[] {
    return this.getFilteredTasks()[columnId];
  }

  getColumnCount(columnId: ColumnId): number {
    return this.getFilteredTasks()[columnId].length;
  }

  getAssigneeColor(assignee: string): string {
    const colors: { [key: string]: string } = {
      's': '#fb8500',
      'p': '#06b6d4',
      'k': '#2dd4bf',
      'n': '#0ea5e9'
    };
    return colors[assignee] || '#6b7280';
  }
}