import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-task-card',
  standalone: true,
  templateUrl: './task-card.html',
  styleUrls: ['./task-card.scss']
})
export class TaskCard {
  @Input() task: any;
}