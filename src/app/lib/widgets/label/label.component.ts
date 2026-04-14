/**
 * A label with help icon and associated help message.
 */
import {Component, Input} from '@angular/core';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'lfb-label',
  template: `
    <label *ngIf="title" [attr.for]="for" class="col-form-label align-self-center p-0">{{ title }}</label>
    <div *ngIf="title && helpMessage" tabindex="0" class="lfb-help-icon" [matTooltip]="helpMessage"
         [attr.aria-label]="'Tooltip for '+title+': '+helpMessage">
      <fa-icon [icon]="helpIcon" aria-hidden="true"></fa-icon>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
    }
    label {
      margin-bottom: 0;
    }
    .lfb-help-icon {
      color: #A8A8A8;
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }
    .lfb-help-icon fa-icon {
      color: #A8A8A8;
      font-size: 16px;
    }
  `]
})
export class LabelComponent {

  // Input properties
  @Input()
  title: string;
  @Input()
  helpMessage: string;
  @Input()
  helpIcon = faInfoCircle;
  @Input()
  for: string;
  @Input()
  labelWidthClass: string;
}
