import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This will be the default instance, used when no user API key is provided.
// It relies on the GEMINI_API_KEY environment variable being set on the server.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
