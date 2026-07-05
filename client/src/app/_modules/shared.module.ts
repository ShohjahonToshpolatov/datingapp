import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimeagoModule } from 'ngx-timeago';
@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ToastrModule.forRoot(),
    PaginationModule.forRoot(),
    ButtonsModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    TimeagoModule.forRoot()
  ],
  exports: [
    BsDropdownModule,
    BsDatepickerModule,
    ToastrModule,
    PaginationModule,
    ButtonsModule,
    FormsModule,
    ReactiveFormsModule,
    TimeagoModule
  ]
})
export class SharedModule { }
