export interface ValidationErrorResult {
  success: false;
  error: string;
}

export interface ValidationSuccessResult<T> {
  success: true;
  data: T;
}

export type ValidationResult<T> = ValidationErrorResult | ValidationSuccessResult<T>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(error: string): ValidationErrorResult {
  return { success: false, error };
}

function succeed<T>(data: T): ValidationSuccessResult<T> {
  return { success: true, data };
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateEmail(value: unknown): ValidationResult<string> {
  if (typeof value !== "string") {
    return fail("Email is required");
  }

  const email = normalizeEmail(value);
  if (!email || !EMAIL_RE.test(email) || email.length > 320) {
    return fail("A valid email address is required");
  }

  return succeed(email);
}

export function validatePassword(value: unknown): ValidationResult<string> {
  if (typeof value !== "string") {
    return fail("Password is required");
  }

  const password = value.trim();
  if (password.length < 8) {
    return fail("Password must be at least 8 characters");
  }

  if (password.length > 72) {
    return fail("Password must be 72 characters or fewer");
  }

  return succeed(password);
}

export function validateOptionalDisplayName(value: unknown): ValidationResult<string | null> {
  if (value === undefined || value === null || value === "") {
    return succeed(null);
  }

  if (typeof value !== "string") {
    return fail("Name must be a string");
  }

  const name = value.trim().replace(/\s+/g, " ");
  if (!name) {
    return succeed(null);
  }

  if (name.length > 120) {
    return fail("Name must be 120 characters or fewer");
  }

  return succeed(name);
}

export interface RegistrationInput {
  name: string | null;
  email: string;
  password: string;
}

export function validateRegistrationInput(value: unknown): ValidationResult<RegistrationInput> {
  if (value === null || typeof value !== "object") {
    return fail("Invalid request body");
  }

  const input = value as Record<string, unknown>;
  const email = validateEmail(input.email);
  if (!email.success) {
    return email;
  }

  const password = validatePassword(input.password);
  if (!password.success) {
    return password;
  }

  const name = validateOptionalDisplayName(input.name);
  if (!name.success) {
    return name;
  }

  return succeed({
    name: name.data,
    email: email.data,
    password: password.data,
  });
}

export function clampInteger(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}
