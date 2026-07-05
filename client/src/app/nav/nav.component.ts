import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, NgbDropdownModule, AsyncPipe, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  model: any = {};

  accountService = inject(AccountService);
  router = inject(Router)
  toastr = inject(ToastrService)

  ngOnInit(): void {

  }

  login() {
    this.accountService.login(this.model).subscribe({
      next: response => {
        this.router.navigateByUrl('/members')
        localStorage.setItem('token', response.token);
      },
      error: error => {
        console.log(error)
        this.toastr.error(error.error)
      }
    })
  }

  logout() {
    this.accountService.logout()
    this.router.navigateByUrl('/')
  }

}