import { Component } from '@angular/core';
import { BoardComponent } from './components/board/board';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardComponent],
  template: `<app-board></app-board>`,
  styleUrls: ['./app.scss']
})
// app.component.ts
export class AppComponent {
  title() {
    return 'Angular User';
  }
}
