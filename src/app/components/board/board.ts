import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  title: string;
  desc: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignee: string;
  label: 'BILLING' | 'ACCOUNTS' | 'FORMS' | 'FEEDBACK';
  points: number;
  status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done';
  sprint?: string;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board.html',
  styleUrls: ['./board.scss']
})
export class BoardComponent {
  activeView: 'board' | 'backlog' | 'timeline' | 'reports' | 'team' = 'board';
  selectedSprint = 'Sprint 3';
  showAddTask = false;
  newTaskTitle = '';
  newTaskDesc = '';
  searchTerm = '';
  draggedTask: Task | null = null;
  newTaskStatus: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done' = 'backlog';

  sprints = ['Sprint 3', 'Sprint 4', 'Sprint 5', 'All Sprints'];

  // ⚠️ Empty tasks - तुम्ही स्वतः tasks add करू शकता
  tasks: {
    backlog: Task[];
    todo: Task[];
    inProgress: Task[];
    review: Task[];
    done: Task[];
  } = {
    backlog: [],
    todo: [],
    inProgress: [],
    review: [],
    done: []
  };

  constructor() {
    // Load tasks from localStorage on component init
    this.loadTasksFromStorage();
  }

  // ========================================
  // LOCAL STORAGE METHODS
  // ========================================

  private loadTasksFromStorage(): void {
    const savedTasks = localStorage.getItem('kanban-tasks');
    if (savedTasks) {
      try {
        this.tasks = JSON.parse(savedTasks);
      } catch (e) {
        console.error('Error loading tasks from storage:', e);
      }
    }
  }

  private saveTasksToStorage(): void {
    try {
      localStorage.setItem('kanban-tasks', JSON.stringify(this.tasks));
    } catch (e) {
      console.error('Error saving tasks to storage:', e);
    }
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  getLabelColor(label: string): string {
    const colors: { [key: string]: string } = {
      'BILLING': 'bg-blue-100 text-blue-700',
      'ACCOUNTS': 'bg-green-100 text-green-700',
      'FORMS': 'bg-purple-100 text-purple-700',
      'FEEDBACK': 'bg-amber-100 text-amber-700'
    };
    return colors[label] || 'bg-gray-100 text-gray-700';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'Critical': 'text-red-600',
      'High': 'text-orange-500',
      'Medium': 'text-yellow-500',
      'Low': 'text-green-500'
    };
    return colors[priority] || 'text-gray-500';
  }

  setActiveView(view: 'board' | 'backlog' | 'timeline' | 'reports' | 'team'): void {
    this.activeView = view;
  }

  // ========================================
  // TASK MOVEMENT
  // ========================================

  moveTask(taskId: number, newStatus: string): void {
    const allStatuses: Array<'backlog' | 'todo' | 'inProgress' | 'review' | 'done'> = 
      ['backlog', 'todo', 'inProgress', 'review', 'done'];
    
    let task: Task | undefined;
    let oldStatus: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done' | undefined;

    // Find task and its current status
    for (const status of allStatuses) {
      const foundTask = this.tasks[status].find(t => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        oldStatus = status;
        break;
      }
    }

    if (task && oldStatus && oldStatus !== newStatus) {
      // Remove from old status
      this.tasks[oldStatus] = this.tasks[oldStatus].filter(t => t.id !== taskId);
      
      // Add to new status
      task.status = newStatus as any;
      this.tasks[newStatus as keyof typeof this.tasks].push(task);
      this.saveTasksToStorage(); 
    }
  }

  // ========================================
  // DRAG & DROP FUNCTIONALITY
  // ========================================

  onDragStart(event: DragEvent, task: Task): void {
    this.draggedTask = task;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', '');
    }
  }

  onDragEnd(event: DragEvent): void {
    this.draggedTask = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, newStatus: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'): void {
    event.preventDefault();
    
    if (this.draggedTask && this.draggedTask.status !== newStatus) {
      this.moveTask(this.draggedTask.id, newStatus);
    }
  }

  // ========================================
  // SEARCH & FILTER
  // ========================================

  getFilteredTasks(status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'): Task[] {
    let filtered = this.tasks[status];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) || 
        task.desc.toLowerCase().includes(search)
      );
    }

    // Filter by sprint (if not "All Sprints")
    if (this.selectedSprint !== 'All Sprints') {
      filtered = filtered.filter(task => task.sprint === this.selectedSprint);
    }

    return filtered;
  }

  getAllBacklogTasks(): Task[] {
    let allTasks = [...this.tasks.backlog];

    // Filter by sprint
    if (this.selectedSprint !== 'All Sprints') {
      allTasks = allTasks.filter(task => task.sprint === this.selectedSprint);
    }

    return allTasks;
  }

  // ========================================
  // ADD TASK MODAL
  // ========================================

  openAddTaskModal(status?: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'): void {
    this.showAddTask = true;
    this.newTaskStatus = status || 'backlog';
  }

  closeAddTaskModal(): void {
    this.showAddTask = false;
    this.newTaskTitle = '';
    this.newTaskDesc = '';
    this.newTaskStatus = 'backlog';
  }

  addNewTask(): void {
    if (this.newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: this.newTaskTitle,
        desc: this.newTaskDesc || 'No description',
        priority: 'Medium',
        assignee: 'SR',
        label: 'ACCOUNTS',
        points: 2,
        status: this.newTaskStatus,
        sprint: this.selectedSprint !== 'All Sprints' ? this.selectedSprint : 'Sprint 3'
      };
      
      this.tasks[this.newTaskStatus].push(newTask);
       this.saveTasksToStorage();
      this.closeAddTaskModal();
    }
    
  }
  deleteTask(taskId: number, status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasks[status] = this.tasks[status].filter(t => t.id !== taskId);
      this.saveTasksToStorage();
    }
  }

  // ========================================
  // SPRINT FUNCTIONALITY
  // ========================================

  startSprint(): void {
    const backlogTasks = this.getAllBacklogTasks();
    
    if (backlogTasks.length === 0) {
      alert('No tasks in backlog for this sprint!');
      return;
    }

    // Backlog मधील सर्व tasks TO DO मध्ये move करतो
    backlogTasks.forEach(task => {
      this.moveTask(task.id, 'todo');
    });

    alert(`✅ ${this.selectedSprint} started! ${backlogTasks.length} tasks moved to TO DO.`);

    this.saveTasksToStorage();
    
    // Board view वर जा
    this.activeView = 'board';
  }
}