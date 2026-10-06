export function validateIndianMobileNumber(mobile: string): { isValid: boolean; error: string } {
  const trimmed = (mobile || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
  }

  // Clean whitespace, hyphens, brackets and leading country code / zero
  const clean = trimmed.replace(/[\s\-+()]/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');

  if (clean.length !== 10 || !/^\d{10}$/.test(clean)) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
  }

  const dummyNumbers = new Set([
    '0123456789',
    '1234567890',
    '9876543210',
    '9848012345',
  ]);
  const isSequential = clean.split('').every((digit, index, digits) => {
    if (index === 0) return true;
    const difference = Number(digit) - Number(digits[index - 1]);
    return difference === 1 || difference === -1;
  });

  if (dummyNumbers.has(clean) || isSequential) {
    return { isValid: false, error: 'Please enter your real mobile number, not a sample number' };
  }

  if (!/^[6-9]\d{9}$/.test(clean)) {
    return { isValid: false, error: 'Invalid mobile number format' };
  }

  if (/^(\d)\1{9}$/.test(clean)) {
    return { isValid: false, error: 'Invalid mobile number format' };
  }

  return { isValid: true, error: '' };
}

/**
 * Validates strict password strength rules:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 numeric digit
 * - At least 1 special character
 */
export function validatePasswordStrength(password: string, email: string = ''): { isValid: boolean; error: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z)' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z)' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number (0-9)' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?~`'"]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (e.g. !@#$%^&*)' };
  }

  if (email) {
    const prefix = email.split('@')[0].toLowerCase().trim();
    if (prefix && prefix.length >= 3 && password.toLowerCase().includes(prefix)) {
      return { isValid: false, error: 'Password cannot contain your email username' };
    }
  }

  return { isValid: true, error: '' };
}
