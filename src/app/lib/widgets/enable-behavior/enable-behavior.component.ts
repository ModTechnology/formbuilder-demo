/**
 * Widget to represent enableBehaviour field.
 */
import { Component } from '@angular/core';
import {LfbControlWidgetComponent} from '../lfb-control-widget/lfb-control-widget.component';

@Component({
  selector: 'lfb-enable-behavior',
  template: `
    <input *ngIf="schema.widget.id ==='hidden'; else displayTemplate"
           name="{{name}}" type="hidden" [formControl]="control" (keydown.enter)='doEnter($event)'>
    <ng-template #displayTemplate>
      <div class="row m-0">
        <lfb-label [helpMessage]="schema.description" [title]="schema.title"></lfb-label>
        <div role="group">
          <ng-container *ngFor="let option of schema.oneOf">
            <input [formControl]="control" [attr.id]="id + '.' + option.enum[0]" class="btn-check"
                   name="{{id}}" (keydown.enter)='doEnter($event)'
                   [value]="option.enum[0]" type="radio"
                   [attr.disabled]="(schema.readOnly || option.readOnly) ? '' : null">
            <label class="btn btn-outline-success" [attr.for]="id + '.' + option.enum[0]">{{option.description}}</label>
          </ng-container>
          <ng-container *ngFor="let option of schema.enum">
            <input [formControl]="control" [attr.id]="id + '.' + option" class="btn-check"
                   name="{{id}}" (keydown.enter)='doEnter($event)'
                   [value]="option" type="radio"
                   [attr.disabled]="schema.readOnly ? '' : null">
            <label class="btn btn-outline-success" [attr.for]="id + '.' + option">{{displayTexts[option]}}</label>
          </ng-container>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
  ]
})
export class EnableBehaviorComponent extends LfbControlWidgetComponent {
  displayTexts = {
    all: 'All conditions are true',
    any: 'Any condition is true'
  }

  doEnter($event) {
    $event.preventDefault();
  }
}
