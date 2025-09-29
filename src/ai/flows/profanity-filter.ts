'use server';

/**
 * @fileOverview A profanity filter AI agent.
 *
 * - filterProfanity - A function that filters profanity from a given text.
 * - FilterProfanityInput - The input type for the filterProfanity function.
 * - FilterProfanityOutput - The return type for the filterProfanity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterProfanityInputSchema = z.object({
  text: z.string().describe('The text to filter for profanity.'),
});
export type FilterProfanityInput = z.infer<typeof FilterProfanityInputSchema>;

const FilterProfanityOutputSchema = z.object({
  filteredText: z.string().describe('The text with profanity filtered out.'),
  isProfane: z.boolean().describe('Whether the input text contained profanity.'),
});
export type FilterProfanityOutput = z.infer<typeof FilterProfanityOutputSchema>;

export async function filterProfanity(input: FilterProfanityInput): Promise<FilterProfanityOutput> {
  return filterProfanityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filterProfanityPrompt',
  input: {schema: FilterProfanityInputSchema},
  output: {schema: FilterProfanityOutputSchema},
  prompt: `You are a content moderation expert. You will be given a piece of text and your job is to filter out any profanity.

  Respond with the filtered text and a boolean indicating whether the original text contained profanity.

  Text: {{{text}}}`,
});

const filterProfanityFlow = ai.defineFlow(
  {
    name: 'filterProfanityFlow',
    inputSchema: FilterProfanityInputSchema,
    outputSchema: FilterProfanityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
