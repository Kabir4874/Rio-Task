type Environment = Record<string, string | undefined>;

const DEFAULT_PORT = '3000';
const DEFAULT_THROTTLE_TTL_MS = '60000';
const DEFAULT_THROTTLE_LIMIT = '120';
const DEFAULT_CORS_ORIGIN =
  'http://localhost:3000,http://localhost:5173,http://localhost:5174';

function requireValue(env: Environment, key: string) {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

function readNumber(env: Environment, key: string, fallback: string) {
  const rawValue = env[key]?.trim() || fallback;
  const value = Number(rawValue);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${key} must be a positive number`);
  }

  return String(value);
}

export function validateEnv(env: Environment) {
  return {
    ...env,
    PORT: readNumber(env, 'PORT', DEFAULT_PORT),
    DATABASE_URL: requireValue(env, 'DATABASE_URL'),
    CORS_ORIGIN: env.CORS_ORIGIN?.trim() || DEFAULT_CORS_ORIGIN,
    THROTTLE_TTL_MS: readNumber(
      env,
      'THROTTLE_TTL_MS',
      DEFAULT_THROTTLE_TTL_MS,
    ),
    THROTTLE_LIMIT: readNumber(env, 'THROTTLE_LIMIT', DEFAULT_THROTTLE_LIMIT),
  };
}
