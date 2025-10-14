'use server';
/**
 * @fileOverview An AI flow for generating a professional resume summary.
 *
 * - generateSummary - A function that takes user details and returns a professional summary.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateSummaryInputSchema = z.object({
  details: z.string().describe('Key highlights, skills, and career goals to include in the summary.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

export const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated professional summary, written in the first person.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;


export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}


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
