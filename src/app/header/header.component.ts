import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthService, UserProfile} from '../services/auth.service';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {environment} from "../../environments/environment";


@Component({
  selector: 'lfb-header',
  template: `
    <div id="header">
      <img id="logo" src="assets/images/logo.svg" alt="FormBuilder logo">

      <div id="siteNameBox">
        <div id="siteName">AP-HP Formbuilder</div>
        <div id="siteSlogan">Your tool to create HL7<sup>®</sup> FHIR<sup>®</sup> questionnaires.</div>
      </div>

      <div id="headerRight">
        <div *ngIf="isKeycloakEnabled" class="role-label">{{ getFormattedUserRole() }}</div>
        <button *ngIf="showCreateButton" id="btnNewQuestionnaire" type="button" (click)="createQuestionnaire.emit()">
          <span>+</span> New questionnaire
        </button>
        <button *ngIf="isKeycloakEnabled" class="btn-logout" matTooltip="Logout" (click)="logOut()">
          <mat-icon>exit_to_app</mat-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  userProfile: UserProfile | undefined;
  isKeycloakEnabled: boolean = false;

  @Input() showCreateButton: boolean = false;
  @Output() createQuestionnaire = new EventEmitter<void>();

  constructor(public loginService: AuthService,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer) {
    // Register our icon(s)
    this.iconRegistry.addSvgIcon('logo-formbuilder',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/logo.svg'));
    this.iconRegistry.addSvgIcon('logo-aphp',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/aphpLogo.svg'));
    this.iconRegistry.addSvgIcon('import-file',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/import-file-icon.svg'));
  }

  ngOnInit(): void {
    this.userProfile = this.loginService.userProfile;
    // @ts-ignore
    this.isKeycloakEnabled = environment?.keycloakConfig;
  }


  /**
   * Logout
   */
  logOut() {
    this.loginService.logOut();
  }


  getFormattedUserRole(): string {
    if (!this.userProfile?.role) {
      return "";
    }
    let formattedUserRole = '';
    switch (this.userProfile?.role) {
      case `data_formbuilder_admin_${environment?.env}`:
        formattedUserRole = 'Admin'
        break;
      case `data_formbuilder_readonly_${environment?.env}`:
        formattedUserRole = 'Readonly'
        break;
      case `data_formbuilder_front_${environment?.env}`:
        formattedUserRole = 'Front'
        break;
      case `data_formbuilder_data_${environment?.env}`:
        formattedUserRole = 'Data'
        break;
      case `data_formbuilder_csa1_${environment?.env}`:
        formattedUserRole = 'Csa1'
        break;
      case `data_formbuilder_csa2_${environment?.env}`:
        formattedUserRole = 'Csa2'
        break;

    }
    return formattedUserRole;
  }
}
