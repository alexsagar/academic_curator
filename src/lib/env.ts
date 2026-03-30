export function getOptionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function requireEnv(name: string): string {
  const value = getOptionalEnv(name);
  if (value) {
    return value;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

export function hasEnv(name: string): boolean {
  return getOptionalEnv(name) !== null;
}
