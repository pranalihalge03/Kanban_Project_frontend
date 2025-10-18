import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TaskComment {
  id: number;
  text: string;
  timestamp: Date;
  author: string;
}

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
  dueDate?: string;
  comments?: TaskComment[];
}

interface TeamMember {
  id: number;
  name: string;
  initials: string;
  color: string;
  email: string;
  role: string;
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
  selectedAssignee = 'all';
  showAddTask = false;
  showTaskDetails = false;
  showTeamModal = false;
  newTaskTitle = '';
  newTaskDesc = '';
  newTaskPriority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
  newTaskAssignee = '';
  newTaskPoints = 2;
  newTaskLabel: 'BILLING' | 'ACCOUNTS' | 'FORMS' | 'FEEDBACK' = 'ACCOUNTS';
  newTaskDueDate = '';
  searchTerm = '';
  draggedTask: Task | null = null;
  newTaskStatus: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done' = 'backlog';
  selectedTask: Task | null = null;
  newTeamMemberName = '';
  newTeamMemberInitials = '';
  newTeamMemberRole = '';
  newTeamMemberEmail = '';
  newComment = '';
  

  sprints = ['Sprint 3', 'Sprint 4', 'Sprint 5', 'All Sprints'];

  teamMembers: TeamMember[] = [];

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

  addComment(): void {
  if (this.selectedTask && this.newComment.trim()) {
    if (!this.selectedTask.comments) {
      this.selectedTask.comments = [];
    }
    const comment: TaskComment = {
      id: Date.now(),
      text: this.newComment,
      timestamp: new Date(),
      author: 'Current User'
    };
    this.selectedTask.comments.push(comment);
    this.newComment = '';
    this.saveTasksToStorage();
  }
}

deleteComment(taskId: number, commentId: number): void {
  if (this.selectedTask && this.selectedTask.comments) {
    this.selectedTask.comments = this.selectedTask.comments.filter(c => c.id !== commentId);
    this.saveTasksToStorage();
  }
}

  constructor() {
    this.loadTasksFromStorage();
    this.loadTeamMembersFromStorage();
  }


  

  // ========================================
  // LOCAL STORAGE METHODS
  // ========================================

  private loadTasksFromStorage(): void {
    const savedTasks = JSON.parse(sessionStorage.getItem('kanban-tasks') || '{}');
    if (Object.keys(savedTasks).length > 0) {
      this.tasks = savedTasks;
    }
  }

  private saveTasksToStorage(): void {
    sessionStorage.setItem('kanban-tasks', JSON.stringify(this.tasks));
  }

  private loadTeamMembersFromStorage(): void {
    const savedMembers = JSON.parse(sessionStorage.getItem('kanban-team-members') || '[]');
    if (savedMembers.length > 0) {
      this.teamMembers = savedMembers;
    }
  }

  private saveTeamMembersToStorage(): void {
    sessionStorage.setItem('kanban-team-members', JSON.stringify(this.teamMembers));
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

  getTeamMemberColor(initials: string): string {
    const member = this.teamMembers.find(tm => tm.initials === initials);
    return member ? member.color : 'bg-gray-500';
  }

  setActiveView(view: 'board' | 'backlog' | 'timeline' | 'reports' | 'team'): void {
    this.activeView = view;
  }

  // ========================================
  // DRAG & DROP FUNCTIONALITY - FIXED
  // ========================================

  onDragStart(event: DragEvent, task: Task): void {
    this.draggedTask = task;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', '');
    }
    // Add visual feedback
    (event.target as HTMLElement).style.opacity = '0.5';
  }

  onDragEnd(event: DragEvent): void {
    (event.target as HTMLElement).style.opacity = '1';
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
    
    if (this.draggedTask) {
      const oldStatus = this.draggedTask.status;
      
      if (oldStatus !== newStatus) {
        // Remove from old column
        this.tasks[oldStatus] = this.tasks[oldStatus].filter(t => t.id !== this.draggedTask!.id);
        
        // Update task status
        this.draggedTask.status = newStatus;
        
        // Add to new column
        this.tasks[newStatus].push(this.draggedTask);
        
        // Save to storage
        this.saveTasksToStorage();
        
        console.log(`Task moved from ${oldStatus} to ${newStatus}`);
      }
    }
    
    this.draggedTask = null;
  }

  // ========================================
  // SEARCH & FILTER
  // ========================================

  getUniqueAssignees(): string[] {
    const allTasks = [
      ...this.tasks.backlog,
      ...this.tasks.todo,
      ...this.tasks.inProgress,
      ...this.tasks.review,
      ...this.tasks.done
    ];
    const assignees = [...new Set(allTasks.map(t => t.assignee))];
    return assignees.sort();
  }

  getFilteredTasks(status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'): Task[] {
    let filtered = this.tasks[status];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) || 
        task.desc.toLowerCase().includes(search)
      );
    }

    if (this.selectedSprint !== 'All Sprints') {
      filtered = filtered.filter(task => task.sprint === this.selectedSprint);
    }

    if (this.selectedAssignee !== 'all') {
      filtered = filtered.filter(task => task.assignee === this.selectedAssignee);
    }

    return filtered;
  }

  getAllBacklogTasks(): Task[] {
    let allTasks = [...this.tasks.backlog];

    if (this.selectedSprint !== 'All Sprints') {
      allTasks = allTasks.filter(task => task.sprint === this.selectedSprint);
    }

    if (this.selectedAssignee !== 'all') {
      allTasks = allTasks.filter(task => task.assignee === this.selectedAssignee);
    }

    return allTasks;
  }

  // ========================================
  // ADD/EDIT TASK MODAL - FIXED
  // ========================================

  openAddTaskModal(status?: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'): void {
    // Close team modal if open
    this.showTeamModal = false;
    
    this.showAddTask = true;
    this.showTaskDetails = false;
    this.newTaskStatus = status || 'backlog';
    this.resetTaskForm();
    
    // Set default assignee if team members exist
    if (this.teamMembers.length > 0) {
      this.newTaskAssignee = this.teamMembers[0].initials;
    }
  }

  closeAddTaskModal(): void {
    this.showAddTask = false;
    this.resetTaskForm();
  }

  resetTaskForm(): void {
    this.newTaskTitle = '';
    this.newTaskDesc = '';
    this.newTaskPriority = 'Medium';
    this.newTaskPoints = 2;
    this.newTaskLabel = 'ACCOUNTS';
    this.newTaskDueDate = '';
    this.newTaskStatus = 'backlog';
    
    if (this.teamMembers.length > 0) {
      this.newTaskAssignee = this.teamMembers[0].initials;
    } else {
      this.newTaskAssignee = '';
    }
  }

  addNewTask(): void {
    if (this.newTaskTitle.trim() && this.newTaskAssignee) {
      const newTask: Task = {
        id: Date.now(),
        title: this.newTaskTitle,
        desc: this.newTaskDesc || 'No description',
        priority: this.newTaskPriority,
        assignee: this.newTaskAssignee,
        label: this.newTaskLabel,
        points: this.newTaskPoints,
        status: this.newTaskStatus,
        sprint: this.selectedSprint !== 'All Sprints' ? this.selectedSprint : 'Sprint 3',
        dueDate: this.newTaskDueDate
      };
      
      this.tasks[this.newTaskStatus].push(newTask);
      this.saveTasksToStorage();
      this.closeAddTaskModal();
    } else {
      alert('Please fill in the task title and select an assignee!');
    }
  }

  updateTask(): void {
    if (this.selectedTask && this.newTaskTitle.trim()) {
      const allStatuses: Array<'backlog' | 'todo' | 'inProgress' | 'review' | 'done'> = 
        ['backlog', 'todo', 'inProgress', 'review', 'done'];
      
      for (const status of allStatuses) {
        const idx = this.tasks[status].findIndex(t => t.id === this.selectedTask?.id);
        if (idx !== -1) {
          this.tasks[status][idx] = {
            ...this.tasks[status][idx],
            title: this.newTaskTitle,
            desc: this.newTaskDesc,
            priority: this.newTaskPriority,
            assignee: this.newTaskAssignee,
            points: this.newTaskPoints,
            label: this.newTaskLabel,
            dueDate: this.newTaskDueDate
          };
          this.saveTasksToStorage();
          break;
        }
      }
      this.closeTaskDetails();
    }
  }

  deleteTask(taskId: number, status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasks[status] = this.tasks[status].filter(t => t.id !== taskId);
      this.saveTasksToStorage();
      this.closeTaskDetails();
    }
  }

  // ========================================
  // TASK DETAILS MODAL
  // ========================================

  openTaskDetails(task: Task): void {
    this.selectedTask = task;
    this.newTaskTitle = task.title;
    this.newTaskDesc = task.desc;
    this.newTaskPriority = task.priority;
    this.newTaskAssignee = task.assignee;
    this.newTaskPoints = task.points;
    this.newTaskLabel = task.label;
    this.newTaskDueDate = task.dueDate || '';
    this.showTaskDetails = true;
    this.showAddTask = false;
  }

  closeTaskDetails(): void {
    this.showTaskDetails = false;
    this.selectedTask = null;
    this.resetTaskForm();
  }

  

  // ========================================
  // TEAM MANAGEMENT - FIXED
  // ========================================

openTeamModal(): void {
  console.log('Opening team modal');  // हा line ADD करा debug साठी
  
  this.showAddTask = false;
  this.showTaskDetails = false;
  this.showTeamModal = true;  // हे TRUE होतंय का ते पहा
  
  this.newTeamMemberName = '';
  this.newTeamMemberInitials = '';
  this.newTeamMemberRole = '';
  this.newTeamMemberEmail = '';
}

  closeTeamModal(): void {
    this.showTeamModal = false;
    this.newTeamMemberName = '';
    this.newTeamMemberInitials = '';
    this.newTeamMemberRole = '';
    this.newTeamMemberEmail = '';
  }

  addTeamMember(): void {
    if (this.newTeamMemberName.trim() && this.newTeamMemberInitials.trim()) {
      const colors = ['bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-indigo-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Generate email if not provided
      const email = this.newTeamMemberEmail || 
                    `${this.newTeamMemberName.toLowerCase().replace(/\s+/g, '.')}@company.com`;
      
      const newMember: TeamMember = {
        id: Date.now(),
        name: this.newTeamMemberName,
        initials: this.newTeamMemberInitials.toUpperCase(),
        color: randomColor,
        email: email,
        role: this.newTeamMemberRole || 'Team Member'
      };
      
      this.teamMembers.push(newMember);
      this.saveTeamMembersToStorage();
      this.closeTeamModal();
    } else {
      alert('Please fill in name and initials!');
    }
  }

  removeTeamMember(id: number): void {
    if (confirm('Remove this team member?')) {
      this.teamMembers = this.teamMembers.filter(tm => tm.id !== id);
      this.saveTeamMembersToStorage();
    }
  }

  // ========================================
  // REPORTS & ANALYTICS METHODS
  // ========================================

  getReportStats() {
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

  onStatusChange(task: Task, newStatus: string): void {
  const oldStatus = task.status as 'backlog' | 'todo' | 'inProgress' | 'review' | 'done';
  const status = newStatus as 'backlog' | 'todo' | 'inProgress' | 'review' | 'done';
  
  if (oldStatus !== status) {
    this.tasks[oldStatus] = this.tasks[oldStatus].filter(t => t.id !== task.id);
    task.status = status;
    this.tasks[status].push(task);
    this.saveTasksToStorage();
    console.log(`Task "${task.title}" moved from ${oldStatus} to ${status}`);
  }
}

  
  // ========================================
  // SPRINT FUNCTIONALITY
  // ========================================
  // ========================================
  // SPRINT FUNCTIONALITY
  // ========================================

  startSprint(): void {
    const backlogTasks = this.getAllBacklogTasks();
    
    if (backlogTasks.length === 0) {
      alert('No tasks in backlog for this sprint!');
      return;
    }

    backlogTasks.forEach(task => {
      // Remove from backlog
      this.tasks.backlog = this.tasks.backlog.filter(t => t.id !== task.id);
      // Update status and add to todo
      task.status = 'todo';
      this.tasks.todo.push(task);
    });

    this.saveTasksToStorage();
    alert(`${this.selectedSprint} started! ${backlogTasks.length} tasks moved to TODO.`);
    this.activeView = 'board';
  }

  moveTaskFromBacklog(task: Task, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value as 'backlog' | 'todo' | 'inProgress' | 'review' | 'done';
    const oldStatus = task.status;

    if (oldStatus !== newStatus) {
      // Remove from old status
      this.tasks[oldStatus] = this.tasks[oldStatus].filter(t => t.id !== task.id);
      
      // Update task status
      task.status = newStatus;
      
      // Add to new status
      this.tasks[newStatus].push(task);
      
      // Save to storage
      this.saveTasksToStorage();
      
      console.log(`Task "${task.title}" moved from ${oldStatus} to ${newStatus}`);
    }
  }
}
  


