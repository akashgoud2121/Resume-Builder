
'use server';
/**
 * @fileOverview An AI flow for generating a professional resume summary.
 *
 * - generateSummary - A function that takes user details and returns a professional summary.
 */
import { getAiClient } from '@/ai/client';
import { GenerateSummaryInputSchema, GenerateSummaryOutputSchema, type GenerateSummaryInput, type GenerateSummaryOutput } from '@/ai/schemas';

export async function generateSummary(input: GenerateSummaryInput & { userApiKey?: string | null }): Promise<GenerateSummaryOutput> {
  const { userApiKey, ...promptInput } = input;
  const ai = getAiClient(userApiKey || null);

  const prompt = ai.definePrompt({
    name: 'generateSummaryPrompt',
    input: { schema: GenerateSummaryInputSchema },
    output: { schema: GenerateSummaryOutputSchema },
    prompt: `You are an expert career coach and resume writer specializing in creating standout objectives for students.
Your task is to write a concise, impactful, and professional resume summary (2-3 sentences) tailored to the user's specific situation.
It is critical to generate a unique summary based on the inputs. For a larger audience, seeing the same type of objective is boring. Adapt the tone and focus based on their year of study.

- For a 'first-year' or 'second-year' student, emphasize enthusiasm, foundational knowledge, and a strong desire to learn and contribute.
- For a 'third-year' or 'final-year' student, focus more on specialized skills, project experience, and readiness to apply knowledge in a professional setting.

User's Details:
- Year/Level: {{{year}}}
- Major: {{{major}}}
- Specialization: {{{specialization}}}
- Top Skills: {{{skills}}}
- Desired Role: {{{jobType}}}

Generate a professional summary based on these details.
`,
  });

  const generateSummaryFlow = ai.defineFlow(
    {
      name: 'generateSummaryFlow',
      inputSchema: GenerateSummaryInputSchema,
      outputSchema: GenerateSummaryOutputSchema,
    },
    async (flowInput) => {
      const { output } = await prompt(flowInput);
      return output!;
    }
  );

  return generateSummaryFlow(promptInput);
}

    