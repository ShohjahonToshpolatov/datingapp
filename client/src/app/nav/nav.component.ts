import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { User } from '../_models/user';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, NgbDropdownModule, AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  model: any = {};

  accountService = inject(AccountService);
  router = inject(Router)
  toastr = inject(ToastrService)

  isAdmin(user: User) {
    const roles = this.accountService.getRoles(user.token);
    return roles.includes('Admin') || roles.includes('Moderator');
  }

  login() {
    this.accountService.login(this.model).subscribe({
      next: () => this.router.navigateByUrl('/members'),
      error: error => this.toastr.error(error.error)
    })
  }

  logout() {
    this.accountService.logout()
    this.router.navigateByUrl('/')
  }

}
