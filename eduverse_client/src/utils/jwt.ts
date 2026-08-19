/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Safe JWT Payload parser for UTF-8 strings (such as Vietnamese names) and unpadded Base64URL.
 */
export function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const jsonText = new TextDecoder().decode(bytes);
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("[parseJwtPayload] Error parsing token payload:", err);
    return null;
  }
}

/**
 * Checks whether a JWT token is expired (with optional grace period in seconds).
 */
export function isTokenExpired(token: string, bufferSeconds = 0): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) return true;
  if (typeof payload.exp !== "number") return false;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp - bufferSeconds < now;
}
