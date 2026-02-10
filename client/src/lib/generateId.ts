/**
 * Generates a unique canvas ID with the format: canvas-{unique_string}
 * Uses a combination of timestamp and random characters for uniqueness
 */
export function generateCanvasId(): string {
  const timestamp = Date.now().toString(36); // Base36 encoded timestamp
  const randomPart = generateRandomString(8);
  return `canvas-${timestamp}${randomPart}`;
}

/**
 * Generates a unique chat ID with the format: c-{unique_string}
 * Uses a combination of timestamp and random characters for uniqueness
 */
export function generateChatId(): string {
  const timestamp = Date.now().toString(36); // Base36 encoded timestamp
  const randomPart = generateRandomString(8);
  return `c-${timestamp}${randomPart}`;
}

/**
 * Generates a cryptographically random string
 * Falls back to Math.random if crypto is not available
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  // Use crypto API if available (browser & Node.js 18+)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => chars[byte % chars.length]).join('');
  }
  
  // Fallback to Math.random
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validates if a string is a valid canvas ID
 */
export function isValidCanvasId(id: string): boolean {
  // Pattern: canvas-{base36_timestamp}{8_random_chars}
  const pattern = /^canvas-[a-z0-9]{8,}$/;
  return pattern.test(id);
}

/**
 * Validates if a string is a valid chat ID
 * Accepts permanent IDs (c-xxx) and "new" for new chat route
 */
export function isValidChatId(id: string): boolean {
  // Special case for new chat route
  if (id === "new") return true;
  
  // Pattern: c-{base36_timestamp}{8_random_chars}
  const pattern = /^c-[a-z0-9]{8,}$/;
  return pattern.test(id);
}

/**
 * Extracts timestamp from canvas ID (for sorting/debugging)
 */
export function getCanvasTimestamp(canvasId: string): Date | null {
  if (!isValidCanvasId(canvasId)) return null;
  
  const idPart = canvasId.replace('canvas-', '');
  // First part is the base36 timestamp (variable length, typically 8-9 chars)
  const timestampPart = idPart.slice(0, -8); // Remove last 8 random chars
  
  try {
    const timestamp = parseInt(timestampPart, 36);
    return new Date(timestamp);
  } catch {
    return null;
  }
}
