import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from './services/translation.service';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LanguageSelectorComponent, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly currentYear = new Date().getFullYear();
  
  constructor(
    public translationService: TranslationService,
    public authService: AuthService
  ) {}
  
  title(): string {
    return this.translationService.translate('app.title');
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
