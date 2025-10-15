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
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board.html',
  styleUrls: ['./board.scss']  // ✅ Make sure path is correct
})
export class BoardComponent {
  activeView: 'board' | 'backlog' | 'timeline' = 'board';
  selectedSprint = 'Sprint 3';
  showAddTask = false;
  newTaskTitle = '';
  newTaskDesc = '';

  sprints = ['Sprint 3', 'Sprint 4', 'All Sprints'];

  tasks: {
    backlog: Task[];
    todo: Task[];
    inProgress: Task[];
    review: Task[];
    done: Task[];
  } = {
    backlog: [
      { id: 1, title: 'Optimize experience for mobile web', desc: 'Improve mobile responsiveness', priority: 'High', assignee: 'SR', label: 'BILLING', points: 2, status: 'backlog' },
      { id: 2, title: 'Onboard workout options (OWO)', desc: 'Setup workout tracking', priority: 'Medium', assignee: 'MJ', label: 'ACCOUNTS', points: 1, status: 'backlog' },
      { id: 3, title: 'Billing system integration', desc: 'Connect billing API', priority: 'Low', assignee: 'SP', label: 'FORMS', points: 3, status: 'backlog' },
      { id: 4, title: 'Quick payment feature', desc: 'Add payment gateway', priority: 'Medium', assignee: 'PH', label: 'FEEDBACK', points: 3, status: 'backlog' }
    ],
    todo: [
      { id: 5, title: 'Fast trip search optimization', desc: 'Search algorithm improvements', priority: 'High', assignee: 'SR', label: 'ACCOUNTS', points: 4, status: 'todo' },
      { id: 6, title: 'Affiliate links integration', desc: 'Frontend integration work', priority: 'Medium', assignee: 'MJ', label: 'BILLING', points: 2, status: 'todo' }
    ],
    inProgress: [
      { id: 7, title: 'Revise and streamline booking', desc: 'UI/UX improvements', priority: 'High', assignee: 'SP', label: 'ACCOUNTS', points: 2, status: 'inProgress' }
    ],
    review: [
      { id: 8, title: 'Color palette corrections', desc: 'Fix yellow shade issues', priority: 'Low', assignee: 'PH', label: 'FEEDBACK', points: 1, status: 'review' }
    ],
    done: [
      { id: 9, title: 'BugFix: Web-store app crash', desc: 'Critical bug resolved', priority: 'Critical', assignee: 'SR', label: 'FORMS', points: 5, status: 'done' },
      { id: 10, title: 'Software bug fix for app', desc: 'Performance improvements', priority: 'Medium', assignee: 'MJ', label: 'FEEDBACK', points: 3, status: 'done' }
    ]
  };

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

  setActiveView(view: 'board' | 'backlog' | 'timeline'): void {
    this.activeView = view;
  }

  // FIXED: Dropdown change handler - properly moves tasks between columns
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
    }
  }

  // FIXED: Add Task functionality - properly shows modal and adds task
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
        status: 'backlog'
      };
      
      this.tasks.backlog.push(newTask);
      this.closeAddTaskModal();
      
      // Switch to backlog view to show new task
      this.activeView = 'backlog';
    }
  }

  closeAddTaskModal(): void {
    this.showAddTask = false;
    this.newTaskTitle = '';
    this.newTaskDesc = '';
  }

  // FIXED: Open modal properly
  openAddTaskModal(): void {
    this.showAddTask = true;
  }
}