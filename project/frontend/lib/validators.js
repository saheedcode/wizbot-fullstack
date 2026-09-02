// Mirrors the rules in backend/src/validators/authValidators.js so users get
// instant feedback instead of waiting on a round trip to hit the same rule.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  if (!value?.trim()) return 'Email is required';
  if (!EMAIL_RE.test(value.trim())) return 'Please provide a valid email';
  return '';
}

export function validateName(value) {
  if (!value?.trim()) return 'Name is required';
  if (value.trim().length < 2) return 'Name must be at least 2 characters';
  if (value.trim().length > 100) return 'Name must be under 100 characters';
  return '';
}

// Returns an array of unmet rules so the UI can render a live checklist.
export function passwordRules(value = '') {
  return [
    { label: 'At least 8 characters', met: value.length >= 8 },
    { label: 'One lowercase letter', met: /[a-z]/.test(value) },
    { label: 'One uppercase letter', met: /[A-Z]/.test(value) },
    { label: 'One number', met: /[0-9]/.test(value) },
  ];
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  const unmet = passwordRules(value).filter((r) => !r.met);
  if (unmet.length) return 'Password does not meet all requirements yet';
  return '';
}

export function validateOtp(value) {
  if (!value?.trim()) return 'Enter the 6-digit code';
  if (!/^\d{6}$/.test(value.trim())) return 'Code must be 6 digits';
  return '';
}
