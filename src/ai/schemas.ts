/**
 * @fileOverview Schemas and types for AI flows.
 */

import { z } from 'genkit';

export const GenerateSummaryInputSchema = z.object({
  details: z.string().describe('Key highlights, skills, and career goals to include in the summary.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

export const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated professional summary, written in the first person.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;
