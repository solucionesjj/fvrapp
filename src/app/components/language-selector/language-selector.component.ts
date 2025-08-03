import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslationService, Language } from '../../services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="languageMenu" class="language-button">
      <mat-icon>language</mat-icon>
    </button>
    
    <mat-menu #languageMenu="matMenu">
      <button mat-menu-item (click)="setLanguage('es')" [class.active]="getCurrentLanguage() === 'es'">
        <mat-icon>{{ getCurrentLanguage() === 'es' ? 'check' : '' }}</mat-icon>
        <span>{{ translationService.translate('language.spanish') }}</span>
      </button>
      <button mat-menu-item (click)="setLanguage('en')" [class.active]="getCurrentLanguage() === 'en'">
        <mat-icon>{{ getCurrentLanguage() === 'en' ? 'check' : '' }}</mat-icon>
        <span>{{ translationService.translate('language.english') }}</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .language-button {
      color: #333;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .language-button:hover {
      background-color: rgba(255, 255, 255, 1);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }
    
    .active {
      background-color: rgba(0, 0, 0, 0.04);
      font-weight: 500;
    }
    
    mat-menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    mat-menu-item mat-icon {
      margin-right: 0;
      width: 20px;
    }
  `]
})
export class LanguageSelectorComponent {
  constructor(public translationService: TranslationService) {}
  
  setLanguage(language: Language) {
    this.translationService.setLanguage(language);
  }
  
  getCurrentLanguage() {
    return this.translationService.getCurrentLanguage();
  }
}