import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../_models/user';
import { environment } from '../environments/environment';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User>(1);
  private presenceService = inject(PresenceService);
  currentUser$ = this.currentUserSource.asObservable();
  constructor(private http: HttpClient) { }

  get currentUserValue() {
    let user = null;
    const userString = localStorage.getItem('user');
    if (userString) user = JSON.parse(userString);
    return user;
  }

  login(model: any): Observable<any> {
    return this.http.post(this.baseUrl + 'account/login', model).pipe(
      map((user: any) => {
        if (user) {
          this.setCurrentUser(user);
        }
        return user;
      })
    );
  }

  register(model: any): Observable<any> {
    return this.http.post(this.baseUrl + 'account/register', model).pipe(
      map((user: any) => {
        if (user) {
          this.setCurrentUser(user);
        }
        return user;
      })
    );
  }


  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
    this.presenceService.createHubConnection(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null!);
    this.presenceService.stopHubConnection();
  }

  getRoles(token: string): string[] {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!role) return [];
    return Array.isArray(role) ? role : [role];
  }
}
