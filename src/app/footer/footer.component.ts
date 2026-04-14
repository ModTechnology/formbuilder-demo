import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
import appVersion from '../../assets/version.json';
import {environment} from '../../environments/environment';

@Component({
  selector: 'lfb-footer',
  template: `
    <div role="contentinfo" id="fine-print">
      <a href="/" target="_blank" rel="noopener noreferrer">
        <img src="assets/images/aphpLogo.svg" alt="Assistance publique Hôpitaux de Paris" class="footer-logo">
      </a>
      <div class="footer-links">
        <a href="https://www.aphp.fr/mentions-legales" target="_blank" rel="noopener noreferrer">Legal notices</a>
        <span class="sep">|</span>
        <a href="https://github.com/aphp/formbuilder/issues/new" rel="noopener noreferrer">Contact</a>
        <span class="sep">|</span>
        <a href="https://www.aphp.fr/plan-du-site" target="_blank" rel="noopener noreferrer">Site map</a>
        <span class="sep">|</span>
        <a href="https://github.com/aphp/formbuilder" target="_blank" rel="noopener noreferrer">About</a>
        <span *ngIf="appVersion" class="sep">|</span>
        <span *ngIf="appVersion">Version: {{appVersion}}</span>
      </div>
    </div>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit{
  constructor(private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer, private dialog: MatDialog) {
    this.iconRegistry.addSvgIcon('USAgov',
      this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/images/USAgov.svg'));
  }
  appVersion: string;

  ngOnInit(): void {
    if(appVersion?.version) {
      this.appVersion = appVersion.version;
    }
  }
}
