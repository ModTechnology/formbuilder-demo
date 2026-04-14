/**
 * Component for creating a title for a control.
 */
import {Component, Input} from '@angular/core';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'lfb-title',
  template: `
    <span *ngIf="title" class="horizontal control-label">
      {{ title }}
      <div *ngIf="helpMessage" tabindex="0" [attr.aria-label]="'Tooltip for '+title+': '+helpMessage"
           class="lfb-title-icon" [matTooltip]="helpMessage">
        <fa-icon [icon]="helpIcon" aria-hidden="true"></fa-icon>
      </div>
    </span>
  `,
  styles: [`
    .lfb-title-icon {
      display: inline-block;
      padding: 0;
      margin: 0;
      cursor: pointer;
      color: #A8A8A8;
      vertical-align: middle;
    }
    .lfb-title-icon fa-icon {
      color: #A8A8A8;
      font-size: 14px;
    }
  `]
})
export class TitleComponent {

  // Input properties
  @Input()
  title: string;
  @Input()
  helpMessage: string;
  @Input()
  helpIcon = faInfoCircle;

}
