/**
 * @fileOverview Schemas and types for AI flows.
 */

import { z } from 'genkit';

// Summary Generation
export const GenerateSummaryInputSchema = z.object({
  details: z.string().describe('Key highlights, skills, and career goals to include in the summary.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

export const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated professional summary, written in the first person.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

// Experience/Project Bullet Point Generation
export const GenerateExperienceInputSchema = z.object({
    projectTitle: z.string().describe('The title of the project or the role in an experience.'),
    projectDescription: z.string().describe('A brief, high-level description of the project, its goals, or the responsibilities of the role.'),
    technologiesUsed: z.string().describe('A comma-separated list of technologies, languages, or tools used.'),
});
export type GenerateExperienceInput = z.infer<typeof GenerateExperienceInputSchema>;

export const GenerateExperienceOutputSchema = z.object({
    bulletPoints: z.string().describe('The generated bullet points for the experience or project, formatted with hyphens. Each point should follow the STAR or XYZ format.'),
});
export type GenerateExperienceOutput = z.infer<typeof GenerateExperienceOutputSchema>;

// Skills Generation
export const GenerateSkillsInputSchema = z.object({
    summary: z.string().describe('The professional summary from the resume.'),
    experience: z.string().describe('A concatenation of all work experience descriptions.'),
    projects: z.string().describe('A concatenation of all project descriptions.'),
});
export type GenerateSkillsInput = z.infer<typeof GenerateSkillsInputSchema>;

const SkillCategorySchema = z.object({
    categoryName: z.string().describe('The name of the skill category (e.g., "Programming Languages").'),
    skills: z.string().describe('A comma-separated list of skills for that category.'),
});

export const GenerateSkillsOutputSchema = z.object({
  skillCategories: z.array(SkillCategorySchema).describe('An array of categorized skills.'),
});
export type GenerateSkillsOutput = z.infer<typeof GenerateSkillsOutputSchema>;
