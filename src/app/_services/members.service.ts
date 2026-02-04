import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Member } from '../_models/member';
import { map, Observable } from 'rxjs';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  members: Member[] = []

  updateMember(member: Member): Observable<void> {
    return this.http.put<void>(
      this.baseUrl + 'users',
      member,
      this.getHttpOptions()
    ).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  private getHttpOptions() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${user.token}`
      })
    };
  }

  getMembers(): Observable<Member[]> {
    if (this.members.length > 0) return of(this.members);
    return this.http.get<Member[]>(this.baseUrl + 'users', this.getHttpOptions()).pipe(
      map(members => {
        this.members = members;
        return members;
      })
    );
  }

  getMember(username: string): Observable<Member> {
    const member = this.members.find(m => m.username === username)
    if (member !== undefined) return of(member)
    return this.http.get<Member>(this.baseUrl + 'users/' + username, this.getHttpOptions());
  }
}
