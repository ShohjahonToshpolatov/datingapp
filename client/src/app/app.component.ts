import { Component, inject, OnInit } from '@angular/core';
import { NavComponent } from "./nav/nav.component";
import { User } from './_models/user';
import { AccountService } from './_services/account.service';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from "ngx-spinner";

@Component({
  selector: 'app-root',
  imports: [NavComponent, NavComponent, RouterOutlet, NgxSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'client'
  users: any
  accountService = inject(AccountService)

  ngOnInit(): void {
    this.setCurrentUser()
  }

  setCurrentUser() {
    const user: User = JSON.parse(localStorage.getItem('user')!);
    this.accountService.setCurrentUser(user)
  }
}