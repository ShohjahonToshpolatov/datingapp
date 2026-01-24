import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Member } from '../_models/member';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private getHttpOptions() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${user.token}`
      })
    };
  }

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseUrl + 'users', this.getHttpOptions());
  }

  getMember(username: string): Observable<Member> {
    return this.http.get<Member>(this.baseUrl + 'users/' + username, this.getHttpOptions());
  }
}
