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
    prompt: `You are an expert resume writer who creates compelling, human-like bullet points for projects and work experience.
Generate 3-4 bullet points for the following project/experience.
Each bullet point MUST be in the STAR format (Situation, Task, Action, Result) or XYZ format (Accomplished [X] as measured by [Y], by doing [Z]).
Start each bullet point with a hyphen. Do not use repetitive action verbs.

Project/Role Title: {{{projectTitle}}}
Brief Description/Responsibilities: {{{projectDescription}}}
Technologies Used: {{{technologiesUsed}}}
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
