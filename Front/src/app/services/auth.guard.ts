import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, ActivatedRouteSnapshot, RouterStateSnapshot, Route, UrlSegment, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.checkAccess(state.url);
  }

  canMatch(_route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    const url = '/' + segments.map((segment) => segment.path).filter(Boolean).join('/');
    return this.checkAccess(url);
  }

  private checkAccess(url: string): Observable<boolean | UrlTree> {
    if (this.authService.hasValidToken()) {
      return of(true);
    }

    return this.authService.validateToken().pipe(
      map((valid) => {
        if (valid) {
          return true;
        }
        return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: url } });
      }),
      catchError(() => of(this.router.createUrlTree(['/login'], { queryParams: { returnUrl: url } })))
    );
  }
}
