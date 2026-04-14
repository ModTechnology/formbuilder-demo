import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FHIRServer, FhirService} from '../../../services/fhir.service';
import fhir from 'fhir/r4';
import {fhirPrimitives} from '../../../fhir';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {finalize, map, switchMap, tap} from 'rxjs/operators';

interface State {
  searchTerm: string;
  searchField: SearchField;
  fhirServer: FHIRServer;
}

interface SearchField {
  field: string,
  display: string,
  searchFieldPlaceholder: string
}

@Component({
  selector: 'lfb-fhir-search-page',
  styles: [`
    :host { font-family: 'Rubik', sans-serif; }

    .search-page {
      display: flex;
      flex-direction: column;
      gap: 30px;
      height: 100%;
    }

    /* --- Barre d'actions --- */
    .action-bar {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 15px;
    }

    /* Wrapper pour le bouton filtre + dropdown */
    .filter-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .btn-search-field {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px 20px;
      gap: 10px;
      height: 60px;
      background: #EBF2FF;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      font-family: 'Rubik', sans-serif;
      font-size: 16px;
      font-weight: 400;
      color: #153D8A;
    }
    .btn-search-field mat-icon { color: #153D8A; font-size: 20px; }

    /* Panel filtre dropdown */
    .filter-panel {
      position: absolute;
      top: 0;
      left: 0;
      width: 230px;
      background: #EBF2FF;
      border-radius: 5px;
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
      z-index: 100;
    }

    .filter-panel-header {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 10px 20px;
      gap: 10px;
      height: 60px;
      cursor: pointer;
      font-family: 'Rubik', sans-serif;
      font-size: 16px;
      font-weight: 500;
      color: #153D8A;
    }
    .filter-panel-header mat-icon { color: #153D8A; margin-left: auto; }

    .filter-panel-body {
      display: flex;
      flex-direction: column;
      padding: 0 20px 30px;
      gap: 20px;
    }

    .filter-section { display: flex; flex-direction: column; gap: 15px; }

    .filter-section-title {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      font-family: 'Rubik', sans-serif;
      font-size: 16px;
      color: #153D8A;
    }
    .filter-section-title mat-icon { color: #153D8A; font-size: 18px; margin-left: auto; }

    .filter-options { display: flex; flex-direction: column; gap: 10px; padding: 0 20px; }

    .filter-option {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 300;
      color: #153D8A;
      cursor: pointer;
    }
    .filter-option input[type="checkbox"] {
      width: 18px; height: 18px;
      accent-color: #153D8A;
      cursor: pointer;
      flex-shrink: 0;
    }

    .filter-radio {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-family: 'Rubik', sans-serif;
      font-size: 16px;
      color: #153D8A;
      cursor: pointer;
    }
    .filter-radio input[type="radio"] {
      width: 18px; height: 18px;
      accent-color: #153D8A;
      cursor: pointer;
    }

    /* Partie droite de la barre */
    .action-right {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 15px;
      flex: 1;
      height: 60px;
    }

    @media (max-width: 768px) {
      .action-bar {
        flex-direction: column;
        height: auto;
      }
      .action-right {
        flex-direction: column;
        height: auto;
        width: 100%;
      }
      .btn-search-field,
      .btn-import {
        width: 100%;
        justify-content: space-between;
      }
      .search-input-wrapper {
        width: 100%;
      }
      .search-input {
        width: 100%;
      }
    }

    .btn-import {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px 20px;
      gap: 10px;
      height: 60px;
      background: #EFD8FF;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      font-family: 'Rubik', sans-serif;
      font-size: 16px;
      font-weight: 400;
      color: #77158A;
      flex-shrink: 0;
    }
    .btn-import mat-icon { color: #77158A; }

    .search-input-wrapper { display: flex; flex: 1; height: 60px; }

    .search-input {
      width: 100%;
      height: 60px;
      padding: 10px 15px;
      border: 1px solid #000000;
      border-radius: 5px;
      font-family: 'Rubik', sans-serif;
      font-size: 16px;
      font-weight: 300;
      color: rgba(0, 0, 0, 0.6);
      outline: none;
      background: white;
    }
    .search-input:focus { border-color: #153D8A; color: #000; }

    /* --- Section résultats --- */
    .results-section { display: flex; flex-direction: column; gap: 20px; flex: 1; overflow: hidden; min-height: 0; }

    .results-count {
      font-family: 'Rubik', sans-serif;
      font-style: italic;
      font-weight: 300;
      font-size: 20px;
      color: #000;
      align-self: flex-end;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    .loading-spinner mat-spinner ::ng-deep circle {
      stroke: #153D8A;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .result-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 20px 30px;
      gap: 30px;
      background: #EBF2FF;
      border-radius: 5px;
    }

    .item-info {
      flex: 1;
      font-family: 'Rubik', sans-serif;
      font-size: 16px;
      font-weight: 400;
      color: #000;
      line-height: 1.6;
    }

    .btn-ouvrir {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px 20px;
      width: 163px;
      height: 50px;
      background: #D8E6FF;
      border-radius: 42px;
      border: none;
      cursor: pointer;
      font-family: 'Rubik', sans-serif;
      font-size: 16px;
      font-weight: 400;
      color: #153D8A;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .btn-ouvrir:hover { background: #c0d4ff; }

    .load-more-sentinel {
      display: flex;
      justify-content: center;
      padding: 20px 0;
      min-height: 1px;
    }

    /* Skeleton loading */
    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
      overflow: hidden;
    }
    .skeleton-item {
      display: flex;
      align-items: center;
      padding: 20px 30px;
      gap: 30px;
      background: #F3F5F9;
      border-radius: 5px;
    }
    .skeleton-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .skeleton-line {
      height: 14px;
      border-radius: 4px;
      background: linear-gradient(90deg, #E8ECF1 25%, #F3F5F9 50%, #E8ECF1 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
    }
    .skeleton-title { width: 60%; height: 16px; }
    .skeleton-id { width: 35%; }
    .skeleton-meta { width: 45%; }
    .skeleton-meta.short { width: 30%; }
    .skeleton-btn {
      width: 163px;
      height: 50px;
      border-radius: 42px;
      background: linear-gradient(90deg, #E8ECF1 25%, #F3F5F9 50%, #E8ECF1 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
      flex-shrink: 0;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
  templateUrl: 'fhir-search-page.component.html'
})
export class FhirSearchPageComponent implements OnInit, AfterViewInit, OnDestroy {

  private _loading$ = new BehaviorSubject<boolean>(false);
  private _search$ = new Subject<void>();
  private _bundle$ = new BehaviorSubject<fhir.Bundle>(null);
  private sentinelObserver: IntersectionObserver | null = null;

  inputTerm = '';
  resultsOffset = 0; // To calculate serial number of the results across pages
  pageSize = 20;
  nextUrl: fhirPrimitives.url = null;
  prevUrl: fhirPrimitives.url = null;
  total: number = undefined;
  questionnaires: fhir.Questionnaire [] = [];
  loadingMore = false;

  @Input()
  hasResumeFormOption: boolean = false;

  @Output() selectedQuestionnaire = new EventEmitter<fhir.Questionnaire>();

  @Output() importFromLocalFile = new EventEmitter<boolean>();

  @Output() resumeTheLastForm = new EventEmitter<boolean>;

  searchFieldList: SearchField [] = [
    {field: 'title:contains', display: 'Form title only', searchFieldPlaceholder: 'Search by title'},
    {field: 'code', display: 'Item code', searchFieldPlaceholder: 'Search by code'},
  ];

  filterPanelOpen: boolean = false;

  statusOptions = [
    {value: 'draft', label: 'Draft'},
    {value: 'active', label: 'Active'},
    {value: 'retired', label: 'Retired'},
    {value: 'unknown', label: 'Unknown'},
  ];

  selectedStatuses: string[] = ['draft'];

  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
  }

  isStatusSelected(value: string): boolean {
    return this.selectedStatuses.includes(value);
  }

  toggleStatus(value: string): void {
    const idx = this.selectedStatuses.indexOf(value);
    if (idx >= 0) {
      this.selectedStatuses.splice(idx, 1);
    } else {
      this.selectedStatuses.push(value);
    }
  }

  @ViewChild('searchInputElement') inputField!: ElementRef<HTMLInputElement>;
  @ViewChild('loadMoreSentinel') loadMoreSentinel!: ElementRef;

  ngAfterViewInit(): void {
    this.inputField?.nativeElement.focus();
    this.setupSentinelObserver();
  }

  ngOnDestroy(): void {
    this.sentinelObserver?.disconnect();
  }

  private setupSentinelObserver(): void {
    this.sentinelObserver = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && this.nextUrl && !this.loadingMore) {
        this.loadItems();
      }
    }, { threshold: 0.1 });

    // Re-observe whenever the sentinel element appears (after data loads)
    const checkSentinel = () => {
      if (this.loadMoreSentinel?.nativeElement) {
        this.sentinelObserver?.observe(this.loadMoreSentinel.nativeElement);
      }
      requestAnimationFrame(checkSentinel);
    };
    checkSentinel();
  }

  private _state: State = {
    searchTerm: '',
    searchField: this.searchFieldList[0],
    fhirServer: this.fhirService.getFhirServer()
  };

  constructor(public fhirService: FhirService) {

    this._search$.pipe(
      tap(() => {
        this._loading$.next(true);
        this.pageSize = 20;
      }),
      switchMap(() => this._search()),
      finalize(() => this._loading$.next(false))
    )
      .subscribe((bundle) => {
        this.total = undefined; // Reset total before processing bundle
        this._bundle$.next(bundle);
      });

    // Set up bundle pipe line. Bundle could be invoked either by search or navigation.
    this.bundle$.pipe(map((bundle) => {
        if (!bundle) {
          this.questionnaires = [] as fhir.Questionnaire[];
          return null; // Might happen when initializing _bundle$
        }
        if (bundle.total !== undefined) { // page bundles may not have total. The existing total is valid.
          this.total = bundle.total;
        }

        // Capture navigation urls.
        this.nextUrl = null;
        this.prevUrl = null;
        if (bundle.link && bundle.link.length > 0) {
          bundle.link.forEach((lnk) => {
            switch (lnk.relation) {
              case 'self':
                this.resultsOffset = this._getOffset(lnk.url);
                break;
              case 'next':
                this.nextUrl = lnk.url;
                break;
              case 'prev':
              case 'previous':
                this.prevUrl = lnk.url;
                break;
            }
          });
        }

        if (!bundle.entry) {
          return null;
        }
        return bundle.entry.map((e) => {
          // Trim down resource
          const res = e.resource;
          const ret = {};
          ['id', 'title', 'name', 'publisher', 'version', 'effectivePeriod', 'status', 'code', 'meta'].forEach((f) => {
            if (res[f]) {
              ret[f] = res[f];
            }
          });
          return ret;
        });
      })
    ).subscribe((resources: fhir.Questionnaire []) => {
      if (resources && this.questionnaires?.length > 0 && this.resultsOffset > 0) {
        this.questionnaires = [...this.questionnaires, ...resources];
      } else {
        this.questionnaires = resources;
      }
      this.loadingMore = false;
      this._loading$.next(false)
    });
  }

  get loading$() {
    return this._loading$.asObservable();
  }

  get bundle$() {
    return this._bundle$.asObservable();
  }

  get searchTerm() {
    return this._state.searchTerm;
  }

  set searchTerm(searchTerm: string) {
    this._set({searchTerm});
  }

  get searchField() {
    return this._state.searchField;
  }

  set searchField(searchField: SearchField) {
    this._set({searchField});
  }

  get selectedFHIRServer() {
    return this._state.fhirServer;
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
  }

  private _search(): Observable<fhir.Bundle> {
    const params: any = {_count: this.pageSize};
    if (this.selectedStatuses.length > 0) {
      params['status'] = this.selectedStatuses.join(',');
    }
    return this.fhirService.search('Questionnaire', this.searchTerm, this.searchField.field, params);
  }

  ngOnInit(): void {
    this.searchTerm = this.inputTerm;
    this._search$.next();
  }

  searchInput() {
    this.searchTerm = this.inputTerm;
    this._search$.next();
  }

  nextPage(): void {
    this.getBundleByUrl(this.nextUrl);
  }

  prevPage(): void {
    this.getBundleByUrl(this.prevUrl);
  }

  getBundleByUrl(url: fhirPrimitives.url): void {
    this.fhirService.getBundleByUrl(url).subscribe((bundle) => {
      this._bundle$.next(bundle);
    });
  }

  _getOffset(url: fhirPrimitives.url): number {
    let ret = '';
    if (url) {
      ret = new URL(url).searchParams.get('_getpagesoffset');
    }
    return ret ? parseInt(ret, 10) : 0;
  }

  selectQuestionnaire(questionnaireId: any): void {
    this.selectedQuestionnaire.emit(questionnaireId);
  }

  importQuestionnaireFromLocalFile() {
    this.importFromLocalFile.emit(true);
  }

  resumeTheLastQuestionnaire() {
    this.resumeTheLastForm.emit(true);
  }

  loadItems() {
    if (this.nextUrl && !this.loadingMore) {
      this.loadingMore = true;
      this.nextPage();
    }
  }
}
