export function validateIndianMobileNumber(mobile: string): { isValid: boolean; error: string } {
  const trimmed = (mobile || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
  }

  // Clean whitespace, hyphens, brackets and leading country code / zero
  const clean = trimmed.replace(/[\s\-\+\(\)]/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');

  if (clean.length !== 10 || !/^\d{10}$/.test(clean)) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
  }

  if (!/^[6-9]\d{9}$/.test(clean)) {
    return { isValid: false, error: 'Invalid mobile number format' };
  }

  if (/^(\d)\1{9}$/.test(clean)) {
    return { isValid: false, error: 'Invalid mobile number format' };
  }

  return { isValid: true, error: '' };
}
