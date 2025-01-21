import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Email Validator
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailPattern.test(control.value);
    return valid ? null : { invalidEmail: true };
  };
}

// Phone Number Validator
export function argentinaPhoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const phonePattern = /^([1-9][0-9]{1,4})+[0-9]{6,}$/;
    const valid = phonePattern.test(control.value);
    return valid ? null : { invalidPhoneNumber: true };
  };
}

// Validator to check for special characters
export function specialCharacterValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
    return hasSpecialChar ? null : { specialCharacter: true };
  };
}

// Validator to check for at least one number
export function numberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasNumber = /\d/.test(control.value);
    return hasNumber ? null : { number: true };
  };
}

// Validator to check for at least one uppercase letter
export function uppercaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasUppercase = /[A-Z]/.test(control.value);
    return hasUppercase ? null : { uppercase: true };
  };
}

export function lowercaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasLowercase = /[a-z]/.test(control.value);
    return hasLowercase ? null : { lowercase: true };
  };
}
