import validator from 'validator';

// PASSWORD VALIDATION
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (!validator.isLength(password, { min: 8 })) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return null;
};

// EMAIL VALIDATION
export const validateEmail = (email) => {
  return validator.isEmail(email);
}


// PHONE NUMBER VALIDATION (PHILIPPINES)
export const validatePhone = (phone) => {
  return /^(09\d{9}|9\d{9})$/.test(phone);
}