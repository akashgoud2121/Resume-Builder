'use server';
/**
 * @fileOverview An AI flow for generating categorized technical skills.
 *
 * - generateSkills - A function that takes resume context and returns categorized skills.
 */

import { getAiClient } from '@/ai/client';
import { GenerateSkillsInputSchema, GenerateSkillsOutputSchema, type GenerateSkillsInput, type GenerateSkillsOutput } from '@/ai/schemas';

export async function generateSkills(input: GenerateSkillsInput & { userApiKey?: string | null }): Promise<GenerateSkillsOutput> {
  const { userApiKey, ...promptInput } = input;
  const ai = getAiClient(userApiKey || null);
  
  const prompt = ai.definePrompt({
    name: 'generateSkillsPrompt',
    input: { schema: GenerateSkillsInputSchema },
    output: { schema: GenerateSkillsOutputSchema },
    prompt: `You are an expert resume writer and tech recruiter who helps students identify their key technical skills based on their experience.
Analyze the provided resume context (summary, experience, and projects) and generate a list of relevant technical skills.
Organize these skills into logical categories (e.g., "Programming Languages", "Frameworks & Libraries", "Developer Tools", "Databases").
For each category, provide a comma-separated list of skills.

Resume Context:
---
{{#if summary}}
Summary: {{{summary}}}
{{/if}}

{{#if experience}}
Experience: {{{experience}}}
{{/if}}

{{#if projects}}
Projects: {{{projects}}}
{{/if}}
---
`,
  });

  const generateSkillsFlow = ai.defineFlow(
    {
      name: 'generateSkillsFlow',
      inputSchema: GenerateSkillsInputSchema,
      outputSchema: GenerateSkillsOutputSchema,
    },
    async (flowInput) => {
      const { output } = await prompt(flowInput);
      return output!;
    }
  );

  return generateSkillsFlow(promptInput);
}
