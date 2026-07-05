import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { take } from 'rxjs/operators';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {

  const accountService = inject(AccountService);

  let currentUser: any;

  accountService.currentUser$
    .pipe(take(1))
    .subscribe(user => currentUser = user);

  if (currentUser?.token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
      }
    });
  }

  return next(request);
};