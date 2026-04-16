import crypto from 'crypto';

// A chave deve ter 32 bytes (256 bits) em HEX, ex: crypto.randomBytes(32).toString('hex')
// Em produção, a ENCRYPTION_KEY OBRIGATORIAMENTE deve vir das variáveis de ambiente.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.hash('sha256', 'printai-fallback-unsafe-key');
const IV_LENGTH = 16; 

export function encrypt(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('[CRYPTO] Error encrypting string');
    throw new Error('Encryption failed');
  }
}

export function decrypt(text: string): string {
  if (!text) return text;
  // Fallback para dados legados não criptografados (ainda não migrados)
  if (!text.includes(':')) return text; 

  try {
    const textParts = text.split(':');
    if (textParts.length !== 3) return text; // Segurança contra formatos inválidos
    
    const iv = Buffer.from(textParts[0], 'hex');
    const authTag = Buffer.from(textParts[1], 'hex');
    const encryptedText = Buffer.from(textParts[2], 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('[CRYPTO] Error decrypting string');
    return '***DADO INDISPONÍVEL (ERRO CRYPTO)***';
  }
}

export function hashString(text: string): string {
  if (!text) return text;
  return crypto.createHash('sha256').update(text).digest('hex');
}
