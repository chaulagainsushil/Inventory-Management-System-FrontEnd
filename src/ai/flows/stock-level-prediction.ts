'use server';

/**
 * @fileOverview Provides AI-driven suggestions for target inventory reorder values, displayed with a progress bar.
 *
 * - stockLevelPrediction - A function that handles the stock level prediction process.
 * - StockLevelPredictionInput - The input type for the stockLevelPrediction function.
 * - StockLevelPredictionOutput - The return type for the stockLevelPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StockLevelPredictionInputSchema = z.object({
  monthlyRevenue: z.number().describe('The monthly revenue.'),
  totalProducts: z.number().describe('The total number of products.'),
  stockAlerts: z.number().describe('The number of stock alerts (items running low).'),
  currentInventoryValue: z.number().describe('The current inventory value.'),
});
export type StockLevelPredictionInput = z.infer<typeof StockLevelPredictionInputSchema>;

const StockLevelPredictionOutputSchema = z.object({
  targetStockRefillValue: z.number().describe('The target inventory reorder value suggested by AI.'),
  reasoning: z.string().describe('The reasoning behind the suggested reorder value.'),
});
export type StockLevelPredictionOutput = z.infer<typeof StockLevelPredictionOutputSchema>;

export async function stockLevelPrediction(input: StockLevelPredictionInput): Promise<StockLevelPredictionOutput> {
  return stockLevelPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockLevelPredictionPrompt',
  input: {schema: StockLevelPredictionInputSchema},
  output: {schema: StockLevelPredictionOutputSchema},
  prompt: `You are an AI assistant that analyzes inventory data and suggests optimal reorder values.

  Based on the following data, suggest a target inventory reorder value and explain your reasoning.

  Monthly Revenue: {{{monthlyRevenue}}}
  Total Products: {{{totalProducts}}}
  Stock Alerts: {{{stockAlerts}}}
  Current Inventory Value: {{{currentInventoryValue}}}

  Consider factors like sales trends, product variety, and potential stockouts.
  Provide a target stock refill value and the reasoning behind it.  The targetStockRefillValue should always be greater than currentInventoryValue.
`,
});

const stockLevelPredictionFlow = ai.defineFlow(
  {
    name: 'stockLevelPredictionFlow',
    inputSchema: StockLevelPredictionInputSchema,
    outputSchema: StockLevelPredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
