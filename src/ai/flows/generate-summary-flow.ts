'use server';
/**
 * @fileOverview An AI flow for generating a professional resume summary.
 *
 * - generateSummary - A function that takes user details and returns a professional summary.
 */

import { ai } from '@/ai/genkit';
import { GenerateSummaryInputSchema, GenerateSummaryOutputSchema, type GenerateSummaryInput, type GenerateSummaryOutput } from '@/ai/schemas';

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  const prompt = ai.definePrompt({
    name: 'generateSummaryPrompt',
    input: { schema: GenerateSummaryInputSchema },
    output: { schema: GenerateSummaryOutputSchema },
    prompt: `You are an expert resume writer and career coach. Based on the following details, write a concise, impactful, and professional summary for a resume. The summary should be 2-4 sentences long.

Key Details:
{{{details}}}
`,
  });

  const generateSummaryFlow = ai.defineFlow(
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

  return generateSummaryFlow(input);
}
