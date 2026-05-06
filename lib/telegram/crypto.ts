import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getSecretMaterial() {
  return (
    process.env.TELEGRAM_TOKEN_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  );
}

function getKey() {
  const material = getSecretMaterial();
  if (!material) {
    throw new Error('Missing token encryption key material');
  }
  return crypto.createHash('sha256').update(material).digest();
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

export function decryptSecret(payload: { ciphertext: string | null; iv: string | null; authTag: string | null }) {
  if (!payload.ciphertext || !payload.iv || !payload.authTag) {
    throw new Error('Missing encrypted secret fields');
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64')),
    decipher.final()
  ]).toString('utf8');
}

export function tokenHint(token: string) {
  const trimmed = token.trim();
  if (trimmed.length <= 8) return 'configured';
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

export function createWebhookSecret() {
  return crypto.randomBytes(32).toString('hex');
}
