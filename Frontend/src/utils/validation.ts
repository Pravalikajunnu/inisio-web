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
