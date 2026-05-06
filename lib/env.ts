/**
 * Environment variable validation
 * Ensures required variables are set and throws clear errors if not
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

const optionalEnvVars = [
  'OPENROUTER_API_KEY',
  'GITHUB_TOKEN',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required vars
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional vars
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env.local file.`
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[ENV] Optional environment variables not set:\n${warnings.map(v => `  - ${v}`).join('\n')}\n` +
      `Some features may not work.`
    );
  }

  return true;
}

export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || fallback || '';
}

// Run validation on import in development
if (process.env.NODE_ENV !== 'production') {
  try {
    validateEnv();
    console.log('[ENV] ✓ All required environment variables are set');
  } catch (error: any) {
    console.error('[ENV] ✗ Environment validation failed:', error.message);
  }
}
