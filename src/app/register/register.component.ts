import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true, // standalone component bo‘lsa
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @Input() usersFromHomeComponent: any;
  @Output() cancelRegister = new EventEmitter();
  model: any = {};
  accountService = inject(AccountService);
  toastr = inject(ToastrService);

  register() {

    if (!this.model.username || !this.model.password) {
      this.toastr.error("Username va password bo‘sh bo‘lishi mumkin emas!");
      return;
    }

    this.accountService.register(this.model).subscribe({
      next: response => {
        console.log(response);
        this.toastr.success("Ro‘yxatdan o‘tish muvaffaqiyatli!");
        this.cancel();
      },
      error: error => {
        console.log(error);
        this.toastr.error(error.error || "Ro‘yxatdan o‘tishda xato yuz berdi");
      }
    });
  }


  cancel() {
    this.cancelRegister.emit(false);
  }
}
