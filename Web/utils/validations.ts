import type { FormError } from '#ui/types';

interface ValidationOptions {
  isMobile: boolean;
  requiresInstitutionalEmail?: boolean;
  minPasswordLength?: number | null;
}

export interface FormState {
  email: string;
  password: string;
  secPasword?: string;
}

export interface ValidationErrors {
  emailError: string;
  passwordError: string;
  secPasswordError?: string;
}

// Password validation utility function
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  validCount: number;
  totalRules: number;
} {
  const rules = [
    password.length >= 8, // At least 8 characters
    /[A-Z]/.test(password), // Uppercase letter
    /[a-z]/.test(password), // Lowercase letter
    /\d/.test(password), // Number
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) // Special character
  ];

  const validCount = rules.filter(rule => rule).length;
  
  return {
    isValid: validCount >= 4, // At least 4 out of 5 rules must be valid
    validCount,
    totalRules: rules.length
  };
}

export function validateEmail(
  email: string, 
  errors: FormError[],
  emailError: Ref<string> | undefined,
  options: ValidationOptions
): void {
  if (!email) {
    errors.push({ path: 'email', message: ' ' });
    return;
  }
  
  // Regular email format validation
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    const message = 'Email inválido';
    if (!options.isMobile) {
      errors.push({ path: 'email', message: ' ' });
      if (emailError) emailError.value = message;
    } else {
      errors.push({ path: 'email', message });
      if (emailError) emailError.value = '';
    }
    return;
  }
  
  // Institutional email validation (optional)
  if (options.requiresInstitutionalEmail !== false && !email.endsWith('@correo.itm.edu.co')) {
    const message = 'Debe usar un correo institucional';
    if (!options.isMobile) {
      errors.push({ path: 'email', message: ' ' });
      if (emailError) emailError.value = message;
    } else {
      errors.push({ path: 'email', message });
      if (emailError) emailError.value = '';
    }
  }
}

export function validatePassword(
  password: string, 
  errors: FormError[],
  passwordError: Ref<string>,
  options: ValidationOptions,
  checkStrength: boolean = false
): void {
  if (!password) {
    errors.push({ path: 'password', message: ' ' });
    return;
  }
  
  // Password length validation (only if not checking strength)
  if (!checkStrength && options.minPasswordLength && options.minPasswordLength > 0) {
    const minLength = options.minPasswordLength;
    if (password.length < minLength) {
      const message = `Minimo ${minLength} caracteres`;
      if (!options.isMobile) {
        errors.push({ path: 'password', message: ' ' });
        passwordError.value = message;
      } else {
        errors.push({ path: 'password', message });
        passwordError.value = '';
      }
      return;
    }
  }

  // Password strength validation (for registration and password change)
  if (checkStrength) {
    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      const message = 'La contraseña no cumple con los requisitos mínimos';
      if (!options.isMobile) {
        errors.push({ path: 'password', message: ' ' });
        passwordError.value = message;
      } else {
        errors.push({ path: 'password', message });
        passwordError.value = '';
      }
    }
  }
}

export function validatePasswordMatch(
  password: string,
  secPassword: string,
  errors: FormError[],
  secPasswordError: Ref<string>,
  options: ValidationOptions
): void {
  if (!secPassword) {
    errors.push({ path: 'secPasword', message: ' ' });
    return;
  }
  
  if (password !== secPassword) {
    const message = 'Las contraseñas no coinciden';
    if (!options.isMobile) {
      errors.push({ path: 'secPasword', message: ' ' });
      secPasswordError.value = message;
    } else {
      errors.push({ path: 'secPasword', message });
      secPasswordError.value = '';
    }
  }
}

export function createFormValidator(
  emailError?: Ref<string>,
  passwordError?: Ref<string>,
  secPasswordError?: Ref<string>,
  options: ValidationOptions = { isMobile: false },
  checkPasswordStrength: boolean = false
) {
  return (state: FormState): FormError[] => {
    const errors: FormError[] = [];
    
    // Reset error messages
    if (emailError) emailError.value = '';
    if (passwordError) passwordError.value = '';
    if (secPasswordError) secPasswordError.value = '';
    
    // Validate email
    if ('email' in state && state.email !== undefined && emailError) {
      validateEmail(state.email, errors, emailError, options);
    }
    
    // Validate password
    if ('password' in state && state.password !== undefined && passwordError) {
      validatePassword(state.password, errors, passwordError, options, checkPasswordStrength);
    }
    
    // Validate second password if it exists
    if (secPasswordError && state.secPasword !== undefined) {
      validatePasswordMatch(state.password, state.secPasword, errors, secPasswordError, options);
    }
    
    return errors;
  };
}