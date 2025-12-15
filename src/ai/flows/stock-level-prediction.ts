'use server';
/**
 * @fileOverview A flow for predicting optimal stock refill levels.
 *
 * - stockLevelPrediction: A function that takes current inventory metrics and returns an AI-powered suggestion for stock refill value.
 * - StockLevelPredictionInput: The input type for the stockLevelPrediction function.
 * - StockLevelPredictionOutput: The return type for the stockLevelPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const StockLevelPredictionInputSchema = z.object({
  monthlyRevenue: z.number().describe('The monthly revenue in USD.'),
  totalProducts: z.number().int().describe('The total number of unique products in the inventory.'),
  stockAlerts: z.number().int().describe('The number of products currently under the reorder level.'),
  currentInventoryValue: z.number().describe('The current total value of the inventory in USD.'),
});
export type StockLevelPredictionInput = z.infer<typeof StockLevelPredictionInputSchema>;

const StockLevelPredictionOutputSchema = z.object({
  targetStockRefillValue: z.number().describe('The suggested total value in USD to spend on refilling stock.'),
  reasoning: z.string().describe('A brief explanation for the suggested refill value, considering the provided metrics.'),
});
export type StockLevelPredictionOutput = z.infer<typeof StockLevelPredictionOutputSchema>;

const predictionPrompt = ai.definePrompt({
    name: 'stockLevelPredictionPrompt',
    input: { schema: StockLevelPredictionInputSchema },
    output: { schema: StockLevelPredictionOutputSchema },
    prompt: `You are an expert inventory management consultant. Based on the following metrics, predict a target stock refill value and provide a brief reasoning.

    - Monthly Revenue: {{{monthlyRevenue}}}
    - Total Products: {{{totalProducts}}}
    - Stock Alerts: {{{stockAlerts}}}
    - Current Inventory Value: {{{currentInventoryValue}}}
    
    Your goal is to recommend a reordering budget that balances cash flow, storage costs, and the risk of stockouts. A higher number of stock alerts might suggest a need for a larger refill to avoid losing sales. High revenue might support a more aggressive replenishment strategy.`,
});

const stockLevelPredictionFlow = ai.defineFlow(
  {
    name: 'stockLevelPredictionFlow',
    inputSchema: StockLevelPredictionInputSchema,
    outputSchema: StockLevelPredictionOutputSchema,
  },
  async (input) => {
    const { output } = await predictionPrompt(input);
    return output!;
  }
);

export async function stockLevelPrediction(input: StockLevelPredictionInput): Promise<StockLevelPredictionOutput> {
  return stockLevelPredictionFlow(input);
}
