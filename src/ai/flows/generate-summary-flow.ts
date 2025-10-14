'use server';
/**
 * @fileOverview An AI flow for generating a professional resume summary.
 *
 * - generateSummary - A function that takes user details and returns a professional summary.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateSummaryInputSchema, GenerateSummaryOutputSchema, type GenerateSummaryInput, type GenerateSummaryOutput } from '@/ai/schemas';

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  const { apiKey, ...promptData } = input;
    
  // If a user-provided API key exists, create a temporary Genkit instance
  // configured with that key. Otherwise, use the default AI instance.
  const aiInstance = apiKey
    ? genkit({ plugins: [googleAI({ apiKey })] })
    : (await import('@/ai/genkit')).ai;

  const prompt = aiInstance.definePrompt({
    name: 'generateSummaryPrompt',
    input: { schema: GenerateSummaryInputSchema },
    output: { schema: GenerateSummaryOutputSchema },
    prompt: `You are an expert resume writer and career coach. Based on the following details, write a concise, impactful, and professional summary for a resume. The summary should be 2-4 sentences long.

Key Details:
{{{details}}}
`,
  });

  const generateSummaryFlow = aiInstance.defineFlow(
    {
      name: 'generateSummaryFlow',
      inputSchema: GenerateSummaryInputSchema,
      outputSchema: GenerateSummaryOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
      return output!;
    }
  );

  return generateSummaryFlow(promptData);
}
