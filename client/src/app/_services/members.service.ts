import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Member } from '../_models/member';
import { map, Observable, of } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private baseUrl = environment.apiUrl;
  memberCache = new Map<string, PaginatedResult<Member[]>>();
  user: any;
  userParams: UserParams | undefined;

  constructor() {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          this.userParams = new UserParams(user);
          this.user = user

        }
      }
    });
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    if (this.user) {
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }

  getMembers(userParams: UserParams): Observable<PaginatedResult<Member[]>> {
    const cacheKey = Object.values(userParams).join('-');
    const cachedResponse = this.memberCache.get(cacheKey);
    if (cachedResponse) return of(cachedResponse);

    let params = new HttpParams();
    params = params.append('pageNumber', userParams.pageNumber);
    params = params.append('pageSize', userParams.pageSize);
    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    if (userParams.gender) params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return this.http.get<Member[]>(this.baseUrl + 'users', {
      observe: 'response',
      params,
      ...this.getHttpOptions()
    }).pipe(
      map(response => {
        const paginatedResult = new PaginatedResult<Member[]>();
        paginatedResult.result = response.body ?? [];
        const paginationHeader = response.headers.get('Pagination');
        if (paginationHeader) {
          paginatedResult.pagination = JSON.parse(paginationHeader);
        }
        this.memberCache.set(cacheKey, paginatedResult);
        return paginatedResult;
      })
    );
  }

  getMember(username: string): Observable<Member> {
    const cachedMember = [...this.memberCache.values()]
      .reduce((arr: Member[], elem) => arr.concat(elem.result ?? []), [])
      .find((m: Member) => m.username === username);

    if (cachedMember) return of(cachedMember);

    return this.http.get<Member>(this.baseUrl + 'users/' + username, this.getHttpOptions());
  }

  updateMember(member: Member): Observable<void> {
    return this.http.put<void>(
      this.baseUrl + 'users',
      member,
      this.getHttpOptions()
    ).pipe(
      map(() => { })
    );
  }

  setMainPhoto(photoId: number): Observable<void> {
    return this.http.put<void>(
      this.baseUrl + 'users/set-main-photo/' + photoId,
      {},
      this.getHttpOptions()
    );
  }

  deletePhoto(photoId: number) {
    return this.http.delete(
      this.baseUrl + 'users/delete-photo/' + photoId,
      this.getHttpOptions()
    );
  }

  addLike(username: string) {
    return this.http.post(
      this.baseUrl + 'likes/' + username,
      {},
      this.getHttpOptions()
    );
  }

  getLikes(predicate: string) {
    return this.http.get<Member[]>(this.baseUrl + 'likes?predicate=' + predicate, this.getHttpOptions());
  }

  private getHttpOptions() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${user.token}`
      })
    };
  }
}