'use server';
/**
 * @fileOverview An AI flow for generating professional experience/project bullet points.
 *
 * - generateExperience - A function that takes project details and returns well-crafted bullet points.
 */

import { ai } from '@/ai/genkit';
import { GenerateExperienceInputSchema, GenerateExperienceOutputSchema, type GenerateExperienceInput, type GenerateExperienceOutput } from '@/ai/schemas';

export async function generateExperience(input: GenerateExperienceInput): Promise<GenerateExperienceOutput> {
  const prompt = ai.definePrompt({
    name: 'generateExperiencePrompt',
    input: { schema: GenerateExperienceInputSchema },
    output: { schema: GenerateExperienceOutputSchema },
    prompt: `You are an expert resume writer who creates compelling, ATS-friendly, and human-like bullet points for any context (work, project, certification, or achievement).
Generate 2-3 bullet points for the provided context.
Each bullet point MUST be in the STAR format (Situation, Task, Action, Result) or XYZ format (Accomplished [X] as measured by [Y], by doing [Z]).
Start each bullet point with a unique and powerful action verb. Do not repeat action verbs.
Start each bullet point with a hyphen.

Item Title: {{{projectTitle}}}
Context / Description: {{{projectDescription}}}
Associated Skills / Technologies: {{{technologiesUsed}}}
`,
  });

  const generateExperienceFlow = ai.defineFlow(
    {
      name: 'generateExperienceFlow',
      inputSchema: GenerateExperienceInputSchema,
      outputSchema: GenerateExperienceOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
      return output!;
    }
  );

  return generateExperienceFlow(input);
}
