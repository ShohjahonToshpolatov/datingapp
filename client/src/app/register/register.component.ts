import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { DatePickerComponent } from "../_forms/date-picker/date-picker.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, JsonPipe, DatePickerComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @Input() usersFromHomeComponent: any;
  @Output() cancelRegister = new EventEmitter<boolean>();

  private accountService = inject(AccountService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder)
  router = inject(Router);
  maxDate: Date = new Date();
  validationErrors: string[] | undefined;
  registerForm: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]],
    });

    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      const matchValue = control.parent?.get(matchTo)?.value;
      return control.value === matchValue ? null : { notMatching: true };
    };
  }

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toastr.error("Formani to‘liq to‘ldiring!");
      return;
    }

    const model = this.registerForm.getRawValue();

    this.accountService.register(model).subscribe({
      next: () => this.router.navigateByUrl('/members'),
      error: (err) => {
        console.log(err);

        if (err?.error?.errors) {
          this.validationErrors = Object.values(err.error.errors).flat() as string[];
          return;
        }

        if (Array.isArray(err?.error)) {
          this.validationErrors = err.error;
          return;
        }

        this.toastr.error(err?.error || "Ro‘yxatdan o‘tishda xato yuz berdi");
      }
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    let theDob = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes() - theDob.getTimezoneOffset())).toISOString().slice(0, 10);
  }
}