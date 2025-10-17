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
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
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
// REPORTS & ANALYTICS METHODS
// ========================================

getReportStats() {
  let allTasks: Task[] = [];
  
  // Collect all tasks based on selected sprint
  if (this.selectedSprint === 'All Sprints') {
    allTasks = [
      ...this.tasks.backlog,
      ...this.tasks.todo,
      ...this.tasks.inProgress,
      ...this.tasks.review,
      ...this.tasks.done
    ];
  } else {
    allTasks = [
      ...this.tasks.backlog.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.todo.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.inProgress.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.review.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.done.filter(t => t.sprint === this.selectedSprint)
    ];
  }

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'inProgress').length;
  const totalPoints = allTasks.reduce((sum, task) => sum + task.points, 0);
  const completedPoints = allTasks.filter(t => t.status === 'done').reduce((sum, task) => sum + task.points, 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    totalPoints,
    completedPoints,
    completionRate
  };
}

getStatusCount(status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'): number {
  if (this.selectedSprint === 'All Sprints') {
    return this.tasks[status].length;
  }
  return this.tasks[status].filter(t => t.sprint === this.selectedSprint).length;
}

getStatusPercentage(status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'): number {
  const stats = this.getReportStats();
  if (stats.totalTasks === 0) return 0;
  
  const count = this.getStatusCount(status);
  return Math.round((count / stats.totalTasks) * 100);
}

getLabelStats() {
  let allTasks: Task[] = [];
  
  if (this.selectedSprint === 'All Sprints') {
    allTasks = [
      ...this.tasks.backlog,
      ...this.tasks.todo,
      ...this.tasks.inProgress,
      ...this.tasks.review,
      ...this.tasks.done
    ];
  } else {
    allTasks = [
      ...this.tasks.backlog.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.todo.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.inProgress.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.review.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.done.filter(t => t.sprint === this.selectedSprint)
    ];
  }

  const labels = ['BILLING', 'ACCOUNTS', 'FORMS', 'FEEDBACK'];
  const labelStats = labels.map(label => {
    const count = allTasks.filter(t => t.label === label).length;
    const percentage = allTasks.length > 0 ? Math.round((count / allTasks.length) * 100) : 0;
    return { name: label, count, percentage };
  });

  return labelStats.filter(stat => stat.count > 0);
}

getPriorityStats() {
  let allTasks: Task[] = [];
  
  if (this.selectedSprint === 'All Sprints') {
    allTasks = [
      ...this.tasks.backlog,
      ...this.tasks.todo,
      ...this.tasks.inProgress,
      ...this.tasks.review,
      ...this.tasks.done
    ];
  } else {
    allTasks = [
      ...this.tasks.backlog.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.todo.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.inProgress.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.review.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.done.filter(t => t.sprint === this.selectedSprint)
    ];
  }

  const priorities: Array<'Critical' | 'High' | 'Medium' | 'Low'> = ['Critical', 'High', 'Medium', 'Low'];
  const priorityStats = priorities.map(priority => {
    const count = allTasks.filter(t => t.priority === priority).length;
    const percentage = allTasks.length > 0 ? Math.round((count / allTasks.length) * 100) : 0;
    return { name: priority, count, percentage };
  });

  return priorityStats.filter(stat => stat.count > 0);
}

getPriorityBarColor(priority: string): string {
  const colors: { [key: string]: string } = {
    'Critical': 'bg-red-500',
    'High': 'bg-orange-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-green-500'
  };
  return colors[priority] || 'bg-gray-500';
}

getTeamStats() {
  let allTasks: Task[] = [];
  
  if (this.selectedSprint === 'All Sprints') {
    allTasks = [
      ...this.tasks.backlog,
      ...this.tasks.todo,
      ...this.tasks.inProgress,
      ...this.tasks.review,
      ...this.tasks.done
    ];
  } else {
    allTasks = [
      ...this.tasks.backlog.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.todo.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.inProgress.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.review.filter(t => t.sprint === this.selectedSprint),
      ...this.tasks.done.filter(t => t.sprint === this.selectedSprint)
    ];
  }

  const assignees = [...new Set(allTasks.map(t => t.assignee))];
  
  return assignees.map(assignee => {
    const memberTasks = allTasks.filter(t => t.assignee === assignee);
    const totalTasks = memberTasks.length;
    const completed = memberTasks.filter(t => t.status === 'done').length;
    const inProgress = memberTasks.filter(t => t.status === 'inProgress').length;
    const points = memberTasks.reduce((sum, task) => sum + task.points, 0);
    const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

    return {
      assignee,
      totalTasks,
      completed,
      inProgress,
      points,
      completionRate
    };
  });
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

    alert(`${this.selectedSprint} started!  `);

    this.saveTasksToStorage();
    
    // Board view वर जा
    this.activeView = 'board';
  }
}
