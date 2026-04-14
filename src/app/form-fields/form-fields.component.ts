/**
 * Handles editing of form level fields.
 */
import {
  Component,
  Input,
  Output,
  EventEmitter, OnChanges, AfterViewInit, SimpleChanges, ViewChild
} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FetchService} from '../services/fetch.service';
import {AutoCompleteResult} from '../lib/widgets/auto-complete/auto-complete.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormService} from '../services/form.service';
import fhir from 'fhir/r4';
import {Util} from '../lib/util';
import {ArrayProperty, FormComponent, FormProperty} from '@lhncbc/ngx-schema-form';
import {ExtensionsService} from '../services/extensions.service';
import {PropertyGroup} from '@lhncbc/ngx-schema-form/lib/model';

@Component({
  selector: 'lfb-form-fields',
  template: `
    <div class="fl-panel">
      <div class="fl-panel-header">
        <span class="fl-panel-title">General information</span>
      </div>
      <div class="fl-panel-body">
        <sf-form #ngxForm [schema]="qlSchema" appReadonly
                 [model]="questionnaire"
                 (onChange)="valueChanged($event)"
                 (modelReset)="onFormFieldsLoaded($event)"
                 [validators]="validators"
        ></sf-form>
      </div>
    </div>
  `,
  providers: [ExtensionsService],
  styles: [`
    .fl-panel {
      display: flex;
      flex-direction: column;
      padding: 30px 40px 60px;
      gap: 30px;
      background: #FFFFFF;
      height: 100%;
    }
    .fl-panel-header {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .fl-panel-title {
      font-family: 'Rubik', sans-serif;
      font-weight: 500;
      font-size: 24px;
      line-height: 28px;
      color: #000000;
    }
    .fl-panel-body {
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
    }
    .fl-panel-footer {
      display: flex;
      justify-content: flex-end;
    }
    .fl-btn-next {
      padding: 10px 30px;
      height: 50px;
      background: #153D8A;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      font-family: 'Rubik', sans-serif;
      font-size: 16px;
      font-weight: 400;
      color: #FFFFFF;
    }
    .fl-btn-next:hover { background: #1a4aa8; }
  `]
})
export class FormFieldsComponent implements OnChanges, AfterViewInit {

  @ViewChild('ngxForm', {static: false, read: FormComponent}) ngxForm!: FormComponent;
  @Input()
  questionsButtonLabel = 'Create questions';
  @Input()
  questionnaire: fhir.Questionnaire;
  qlSchema: any = {properties: {}}; // Combines questionnaire schema with layout schema.
  notHidden = true;
  acResult: AutoCompleteResult = null;

  objectUrl: any;

  /**
   * Use validators to set up extensions service.
   */
  validators = {
    '/extension': (value, arrayProperty: ArrayProperty, rootProperty: PropertyGroup) => {
      const formPropertyChanged = arrayProperty !== this.extensionsService.extensionsProp;
      if(formPropertyChanged) {
        this.extensionsService.setExtensions(arrayProperty);
      }
      return null;
    }
  };

  @Output()
  state = new EventEmitter<string>();
  @Output()
  questionnaireChange = new EventEmitter<fhir.Questionnaire>();
  loading = false;
  formValue: fhir.Questionnaire;
  constructor(
    private http: HttpClient,
    private dataSrv: FetchService,
    private modal: NgbModal,
    private formService: FormService,
    private extensionsService: ExtensionsService
  ) {
    this.qlSchema = this.formService.getFormLevelSchema();
  }

  ngAfterViewInit() {
    this.adjustRootFormProperty();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.questionnaire) {
      this.loading = true;
    }
  }

  adjustRootFormProperty(): boolean {
    let ret = false;
    const rootProperty = this.ngxForm?.rootProperty;
    // Emit the value after any adjustments.
    // Set '__$codeYesNo' to true, when 'code' is present. The default is false.
    if(!Util.isEmpty(rootProperty?.searchProperty('/code').value)) {
      // Loading is done. Change of value should emit the value in valueChanged().
      rootProperty?.searchProperty('/__$codeYesNo').setValue(true, false);
      ret = true;
    }
    return ret;
  }

  onFormFieldsLoaded(event) {
    this.loading = false;
    this.formValue = event.value;
    if(!this.adjustRootFormProperty()) {
      this.questionnaireChange.emit(Util.convertToQuestionnaireJSON(event.value));
    }
  }
  /**
   * Send message to base page to switch the view.
   */
  setGuidingStep(step: string) {
    this.formService.setGuidingStep(step);
    this.formService.autoSave('state', step); // Record change of state.
  }

  /**
   * Emit the change event.
   */
  valueChanged(event) {
    if(!this.loading) {
      this.questionnaireChange.emit(Util.convertToQuestionnaireJSON(event.value));
    }
  }


  /**
   * Json formatting
   * @param json - JSON object
   */
  stringify(json): string {
    return JSON.stringify(json, null, 2);
  }

  /**
   * Button handler for edit questions
   */
  goToItemEditor(): void {
    this.setGuidingStep('item-editor');
  }
}
