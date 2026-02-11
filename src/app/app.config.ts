import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { ToastrModule } from 'ngx-toastr';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { routes } from './app.routes';
import { jwtInterceptor } from './_interceptors/jwt.interceptor';
import { loadingInterceptor } from './_interceptors/loading.interceptor';
import {
  ReactiveFormsModule

} from '@angular/forms';
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),

    provideHttpClient(withInterceptors([jwtInterceptor, loadingInterceptor])),
    provideRouter(routes),

    importProvidersFrom(
      ReactiveFormsModule,
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
        preventDuplicates: true,
      }),
      BsDropdownModule.forRoot(),
      TabsModule.forRoot()
    ),
  ],
};