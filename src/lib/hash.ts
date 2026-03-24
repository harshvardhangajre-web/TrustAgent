/**
 * Generates a SHA-256 evidence hash from arbitrary string parts.
 * Uses the Web Crypto API — available in both Node 18+ and the Edge Runtime.
 *
 * @param parts  Ordered string values to hash together, joined with "|".
 * @returns      Lowercase hex digest (64 characters).
 */
export async function sha256(...parts: string[]): Promise<string> {
  const text = parts.join("|");
  const encoded = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
