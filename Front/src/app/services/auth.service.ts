import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthUser, LoginPayload, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly EXPIRES_AT_KEY = 'auth_expires_at';

  private token: string | null = null;
  private expiresAt: string | null = null;
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  private authenticatedSubject = new BehaviorSubject<boolean>(false);

  public readonly user$ = this.userSubject.asObservable();
  public readonly isAuthenticated$ = this.authenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  login(email: string, password: string): Observable<AuthUser> {
    const url = `${environment.apiUrl}/auth/login`;
    return this.http.post<LoginResponse>(url, { email, password }).pipe(
      map((response) => this.normalizeLoginResponse(response)),
      tap((response) => this.storeLoginResponse(response)),
      map((response) => response.operator)
    );
  }

  private normalizeLoginResponse(response: LoginResponse): LoginPayload {
    return response.proxyResponse ?? {
      token: response.token || '',
      expires_at: response.expires_at || '',
      operator: response.operator as AuthUser
    };
  }

  logout(): Observable<unknown> {
    const url = `${environment.apiUrl}/auth/logout`;
    return this.http.post(url, {}).pipe(
      tap(() => this.clearStorage()),
      catchError((error) => {
        this.clearStorage();
        return of(error);
      })
    );
  }

  me(): Observable<AuthUser> {
    if (!this.getToken()) {
      return throwError(() => new Error('No token available'));
    }

    const url = `${environment.apiUrl}/auth/me`;
    return this.http.get<AuthUser>(url).pipe(
      tap((user) => {
        this.userSubject.next(user);
        this.authenticatedSubject.next(true);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
      catchError((error) => {
        if (error?.status === 401) {
          this.clearStorage();
        }
        return throwError(() => error);
      })
    );
  }

  validateToken(): Observable<boolean> {
    if (!this.hasValidToken()) {
      this.clearStorage();
      return of(false);
    }

    return this.me().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getToken(): string | null {
    if (!this.token || this.isTokenExpired()) {
      this.clearStorage();
      return null;
    }
    return this.token;
  }

  hasValidToken(): boolean {
    return !!this.token && !this.isTokenExpired();
  }

  private storeLoginResponse(response: LoginPayload): void {
    this.token = response.token;
    this.expiresAt = response.expires_at;
    this.userSubject.next(response.operator);
    this.authenticatedSubject.next(true);

    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.EXPIRES_AT_KEY, response.expires_at);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.operator));
  }

  private loadFromStorage(): void {
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    const savedExpiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    const savedUser = localStorage.getItem(this.USER_KEY);

    if (savedToken && savedExpiresAt && new Date(savedExpiresAt) > new Date()) {
      this.token = savedToken;
      this.expiresAt = savedExpiresAt;
      this.authenticatedSubject.next(true);
    }

    if (savedUser) {
      try {
        this.userSubject.next(JSON.parse(savedUser));
      } catch {
        this.userSubject.next(null);
      }
    }
  }

  private isTokenExpired(): boolean {
    if (!this.expiresAt) {
      return true;
    }

    return new Date(this.expiresAt).getTime() <= new Date().getTime();
  }

  clearStorage(): void {
    this.token = null;
    this.expiresAt = null;
    this.userSubject.next(null);
    this.authenticatedSubject.next(false);

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.router.navigate(['/login']);
  }
}
