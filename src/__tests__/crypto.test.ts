import { encrypt, decrypt, hashString } from '../lib/crypto';

describe('Crypto Utility (LGPD Art. 46)', () => {
  it('should encrypt and decrypt a document correctly', () => {
    const originalDocument = '123.456.789-00';
    
    // Testa criptografia (deve gerar IV:TAG:ENCRYPTED)
    const encrypted = encrypt(originalDocument);
    expect(encrypted).not.toBe(originalDocument);
    expect(encrypted).toContain(':');

    // Testa descriptografia
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(originalDocument);
  });

  it('should return original text natively for legacy unencrypted data', () => {
    const legacyDoc = '777.888.999-11';
    // Uma string sem ':', indicando que é legado/não criptografado
    const decrypted = decrypt(legacyDoc);
    expect(decrypted).toBe(legacyDoc);
  });

  it('should generate a consistent SHA-256 hash', () => {
    const originalDocument = '123.456.789-00';
    const hash1 = hashString(originalDocument);
    const hash2 = hashString(originalDocument);
    
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(originalDocument);
    expect(hash1).toHaveLength(64); // SHA-256 length in hex
  });

  it('should gracefully handle empty or nullish strings safely', () => {
    expect(encrypt('')).toBe('');
    expect(decrypt('')).toBe('');
    expect(hashString('')).toBe('');
  });
});
