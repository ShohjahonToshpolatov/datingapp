import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private accountService: AccountService, private toastr: ToastrService) { }

  canActivate(): Observable<boolean> {
    return this.accountService.currentUser$.pipe(
      map(user => {
        const roles = user ? this.accountService.getRoles(user.token) : [];
        if (roles.includes('Admin') || roles.includes('Moderator')) return true;

        this.toastr.error('You are not allowed here');
        return false;
      })
    );
  }
}
