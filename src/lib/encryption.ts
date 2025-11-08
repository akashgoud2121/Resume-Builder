/**
 * Client-side encryption utility for local storage
 * Note: This provides obfuscation and makes casual inspection harder,
 * but true security comes from the database storage with authentication.
 */

// Generate a device-specific key (stored in sessionStorage, cleared on tab close)
function getEncryptionKey(): string {
  let key = sessionStorage.getItem('_ek');
  
  if (!key) {
    // Generate a random key for this session
    key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    sessionStorage.setItem('_ek', key);
  }
  
  return key;
}

// Simple XOR cipher with Base64 encoding
function xorEncrypt(text: string, key: string): string {
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(key);
  
  const encrypted = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  // Convert to base64
  return btoa(String.fromCharCode(...encrypted));
}

function xorDecrypt(encrypted: string, key: string): string {
  try {
    // Decode from base64
    const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const keyBytes = new TextEncoder().encode(key);
    
    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Encrypt data before storing in localStorage
 */
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    const key = getEncryptionKey();
    return xorEncrypt(jsonString, key);
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
}

/**
 * Decrypt data from localStorage
 */
export function decryptData<T>(encryptedData: string): T | null {
  try {
    if (!encryptedData) return null;
    
    const key = getEncryptionKey();
    const decrypted = xorDecrypt(encryptedData, key);
    
    if (!decrypted) return null;
    
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Clear encryption key (call on logout)
 */
export function clearEncryptionKey(): void {
  sessionStorage.removeItem('_ek');
}

