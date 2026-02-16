import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslationService } from './services/translation.service';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LanguageSelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly currentYear = new Date().getFullYear();
  
  constructor(public translationService: TranslationService) {}
  
  get title() {
    return this.translationService.t('app.title');
  }
}
