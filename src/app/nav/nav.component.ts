import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, NgbDropdownModule, AsyncPipe],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  model: any = {};

  accountService = inject(AccountService);

  ngOnInit(): void {

  }

  login() {
    this.accountService.login(this.model).subscribe({
      next: response => {
        console.log(response);
        localStorage.setItem('token', response.token);
      },
      error: error => console.log(error)
    })
  }


  logout() {
    this.accountService.logout();
  }


}