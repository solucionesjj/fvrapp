import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  returnUrl = '/step1';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });

    if (this.authService.hasValidToken()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  submit(): void {
    console.log('Login submit', { email: this.email, password: !!this.password });
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = this.translationService.translate('login.error.required');
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        console.log('Login successful');
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        console.error('Login failed', error);
        this.loading = false;
        if (error?.status === 401) {
          this.errorMessage = this.translationService.translate('login.error.invalidCredentials');
        } else if (error?.status === 403) {
          this.errorMessage = this.translationService.translate('login.error.disabled');
        } else {
          this.errorMessage = this.translationService.translate('login.error.generic');
        }
      }
    });
  }
}
