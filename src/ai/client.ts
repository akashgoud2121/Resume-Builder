import {genkit, type Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

let userClient: Genkit | null = null;
let lastApiKey: string | null = null;

/**
 * Gets a Genkit AI instance. If a user-provided API key is available,
 * it initializes a separate client for that user. Otherwise, it returns
 * the default server-side client.
 *
 * @param {string | null} userApiKey - The user's Google AI API key.
 * @returns {Genkit} - The configured Genkit instance.
 */
export function getAiClient(userApiKey: string | null): Genkit {
  if (userApiKey) {
    if (userApiKey !== lastApiKey) {
      console.log('Initializing user-specific AI client.');
      userClient = genkit({
        plugins: [googleAI({apiKey: userApiKey})],
        model: 'googleai/gemini-2.5-flash',
      });
      lastApiKey = userApiKey;
    }
    return userClient!;
  }

  // Fallback to the default, server-configured client
  const {ai} = require('@/ai/genkit');
  return ai;
}
