import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test-errors',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './test-errors.component.html',
  styleUrls: ['./test-errors.component.css']
})
export class TestErrorsComponent {
  baseUrl = 'https://localhost:5001/api/';
  validationErrors: string[] = [];
  http = inject(HttpClient);
  toastr = inject(ToastrService);

  get400Error() {
    this.http.get(this.baseUrl + 'buggy/bad-request').subscribe({
      next: res => console.log(res),
      error: err => {
        console.log('400 Error:', err);
        this.toastr.error(err.message || 'Yomon So\'rov. Tekshirib ko\'ring.', '400 Xato');
      }
    });
  }

  get401Error() {
    this.http.get(this.baseUrl + 'buggy/auth').subscribe({
      next: res => console.log(res),
      error: err => {
        console.log('401 Error:', err);
        this.toastr.error(err.message || 'Tizimga kirish kerak.', '401 Ruxsat Yo\'q');
      }
    });
  }

  get404Error() {
    this.http.get(this.baseUrl + 'buggy/not-found').subscribe({
      next: res => console.log(res),
      error: err => {
        console.log('404 Error:', err);
        this.toastr.error(err.message || 'So\'ralgan resurs topilmadi.', '404 Topilmadi');
      }
    });
  }

  get500Error() {
    this.http.get(this.baseUrl + 'buggy/server-error').subscribe({
      next: res => console.log(res),
      error: err => {
        console.log('500 Error:', err);
        this.toastr.error(err.message || 'Kutilmagan server xatosi.', '500 Server Xatosi');
      }
    });
  }

  get400ValidationError() {
    this.http.post(this.baseUrl + 'account/register', {}).subscribe({
      next: res => console.log(res),
      error: err => {
        console.log('Validation Error:', err);
        const validationErrors = err.error;

        if (validationErrors && typeof validationErrors === 'object') {
          let errorMessage = '<ul>';

          for (const key in validationErrors) {
            if (Array.isArray(validationErrors[key])) {
              validationErrors[key].forEach((msg: string) => {
                errorMessage += `<li>${msg}</li>`;
              });
            } else {
              errorMessage += `<li>${validationErrors[key]}</li>`;
            }
          }
          errorMessage += '</ul>';

          this.toastr.error(errorMessage, 'Validatsiya Xatolari', {
            enableHtml: true,
            closeButton: true,
            timeOut: 10000
          });

        } else {
          this.toastr.error(err.message || 'Validatsiya Xatosi. Konsolni tekshiring.', 'Xato');
        }
      }
    });
  }
}