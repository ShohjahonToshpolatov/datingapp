import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AccountService } from '../_services/account.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const accountService = inject(AccountService);
    let token = null;

    // localStorage’dan o‘qiydi (synchronous)
    const userString = localStorage.getItem('user');
    if (userString) {
        const user = JSON.parse(userString);
        token = user.token;
    }

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};