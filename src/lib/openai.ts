import OpenAI from "openai";

/** Thrown before any network call so placeholder keys never hit OpenAI. */
export class OpenAIConfigError extends Error {
  constructor(
    message: string,
    readonly code:
      | "OPENAI_MISSING"
      | "OPENAI_PLACEHOLDER"
      | "OPENAI_FORMAT"
  ) {
    super(message);
    this.name = "OpenAIConfigError";
  }
}

function looksLikePlaceholder(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    lower.includes("your_openai") ||
    lower.includes("your_ope") ||
    lower.includes("your_key") ||
    lower.includes("paste_your") ||
    lower.includes("placeholder") ||
    lower.includes("api_key_here") ||
    /\byour_/.test(lower)
  );
}

/**
 * Validates OPENAI_API_KEY before creating the client.
 * Call from API routes; never expose raw messages to the browser if they might contain secrets.
 */
export function assertValidOpenAIApiKey(): void {
  const raw = process.env.OPENAI_API_KEY?.trim();
  if (!raw) {
    throw new OpenAIConfigError(
      "Set OPENAI_API_KEY in .env.local (server only), then restart `npm run dev`.",
      "OPENAI_MISSING"
    );
  }
  if (looksLikePlaceholder(raw)) {
    throw new OpenAIConfigError(
      "OPENAI_API_KEY is still a placeholder. Replace it with a real secret from https://platform.openai.com/account/api-keys",
      "OPENAI_PLACEHOLDER"
    );
  }
  if (!raw.startsWith("sk-")) {
    throw new OpenAIConfigError(
      "OPENAI_API_KEY must start with sk- (OpenAI secret key).",
      "OPENAI_FORMAT"
    );
  }
  if (raw.length < 40) {
    throw new OpenAIConfigError(
      "OPENAI_API_KEY looks too short. Copy the full key from the OpenAI dashboard.",
      "OPENAI_FORMAT"
    );
  }
}

/**
 * Singleton OpenAI client.
 * Reads OPENAI_API_KEY from the server environment at runtime.
 * Never call this from client components.
 */
export function getOpenAIClient(): OpenAI {
  assertValidOpenAIApiKey();
  const apiKey = process.env.OPENAI_API_KEY!.trim();
  return new OpenAI({ apiKey });
}

/** GPT model used for all Trust-Agent analysis. */
export const TRUST_AGENT_MODEL = "gpt-4o" as const;
