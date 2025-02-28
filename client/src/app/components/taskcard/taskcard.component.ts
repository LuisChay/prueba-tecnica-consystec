import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-taskcard',
  imports: [CommonModule],
  templateUrl: './taskcard.component.html',
})
export class TaskCardComponent {
  @Input() name!: string;
  @Input() description!: string;
  @Input() state!: boolean;
}
