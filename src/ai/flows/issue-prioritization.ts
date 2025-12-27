'use server';

/**
 * @fileOverview An AI tool that analyzes citizen feedback and issue reports to help prioritize issues.
 *
 * - prioritizeIssue - A function that handles the issue prioritization process.
 * - PrioritizeIssueInput - The input type for the prioritizeIssue function.
 * - PrioritizeIssueOutput - The return type for the prioritizeIssue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeIssueInputSchema = z.object({
  issueDescription: z.string().describe('A description of the issue.'),
  citizenFeedback: z.string().describe('Citizen feedback related to the issue.'),
  criticalFactors: z.string().describe('Critical factors that may affect issue prioritization.'),
});
export type PrioritizeIssueInput = z.infer<typeof PrioritizeIssueInputSchema>;

const PrioritizeIssueOutputSchema = z.object({
  priorityScore: z.number().describe('A numerical score indicating the issue priority.'),
  priorityLevel: z.string().describe('The priority level of the issue (e.g., high, medium, low).'),
  rationale: z.string().describe('The rationale behind the assigned priority level.'),
});
export type PrioritizeIssueOutput = z.infer<typeof PrioritizeIssueOutputSchema>;

export async function prioritizeIssue(input: PrioritizeIssueInput): Promise<PrioritizeIssueOutput> {
  return prioritizeIssueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeIssuePrompt',
  input: {schema: PrioritizeIssueInputSchema},
  output: {schema: PrioritizeIssueOutputSchema},
  prompt: `You are an AI assistant designed to prioritize civic issues based on citizen feedback and critical factors.

  Analyze the following information to determine the priority level of the issue:

  Issue Description: {{{issueDescription}}}
  Citizen Feedback: {{{citizenFeedback}}}
  Critical Factors: {{{criticalFactors}}}

  Based on your analysis, assign a priority score (a number) and priority level (high, medium, or low), and provide a rationale for your decision.  Ensure that the priorityScore value is a number.

  Respond with a JSON object:
  {
    "priorityScore": number,
    "priorityLevel": string,
    "rationale": string
  }`,
});

const prioritizeIssueFlow = ai.defineFlow(
  {
    name: 'prioritizeIssueFlow',
    inputSchema: PrioritizeIssueInputSchema,
    outputSchema: PrioritizeIssueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
