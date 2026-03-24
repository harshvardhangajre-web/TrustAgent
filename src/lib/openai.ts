import OpenAI from "openai";

/**
 * Singleton OpenAI client.
 * Reads OPENAI_API_KEY from the server environment at runtime.
 * Never call this from client components.
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local and restart the dev server."
    );
  }
  return new OpenAI({ apiKey });
}

/** GPT model used for all Trust-Agent analysis. */
export const TRUST_AGENT_MODEL = "gpt-4o" as const;
