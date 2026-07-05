import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      switch (error.status) {

        case 400:
          if (error.error.errors) {
            const modalStateErrors = [];
            for (const key in error.error.errors) {
              if (error.error.errors[key]) {
                modalStateErrors.push(error.error.errors[key]);
              }
            }
            throw modalStateErrors.flat()
          } else {
            toastr.error(error.error, "400 Bad Request");
          }
          break;

        case 401:
          toastr.error("Unauthorized", "401 Error");
          break;

        case 404:
          router.navigate(['/not-found']);
          break;

        case 500:
          const navigationExtras: NavigationExtras = { state: { error: error.error } }
          router.navigate(['/server-error'], navigationExtras)
          break;

        default:
          toastr.error("Unexpected error occurred");
          console.log("Unexpected Error:", error);
          break;
      }

      throw error;
    })
  );
};
