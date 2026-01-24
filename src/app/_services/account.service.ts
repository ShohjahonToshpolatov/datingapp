import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../_models/user';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User>(1);
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
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
        }
        return user;
      })
    );
  }

  register(model: any): Observable<any> {
    return this.http.post(this.baseUrl + 'account/register', model).pipe(
      map((user: any) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user); // avtomatik login
        }
        return user;
      })
    );
  }


  setCurrentUser(user: User) {
    this.currentUserSource.next(user);
  }

  logout() {

    localStorage.removeItem('user');
    this.currentUserSource.next(null!);
  }
}
