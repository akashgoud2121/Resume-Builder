/**
 * @fileOverview Schemas and types for AI flows.
 */

import { z } from 'genkit';

export const GenerateSummaryInputSchema = z.object({
  details: z.string().describe('Key highlights, skills, and career goals to include in the summary.'),
  apiKey: z.string().optional().describe('Optional Google AI API key.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

export const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated professional summary, written in the first person.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;


export const GenerateExperienceInputSchema = z.object({
    projectTitle: z.string().describe('The title of the project or the role in an experience.'),
    projectDescription: z.string().describe('A brief, high-level description of the project, its goals, or the responsibilities of the role.'),
    technologiesUsed: z.string().describe('A comma-separated list of technologies, languages, or tools used.'),
    apiKey: z.string().optional().describe('Optional Google AI API key.'),
});
export type GenerateExperienceInput = z.infer<typeof GenerateExperienceInputSchema>;

export const GenerateExperienceOutputSchema = z.object({
    bulletPoints: z.string().describe('The generated bullet points for the experience or project, formatted with hyphens. Each point should follow the STAR or XYZ format.'),
});
export type GenerateExperienceOutput = z.infer<typeof GenerateExperienceOutputSchema>;
