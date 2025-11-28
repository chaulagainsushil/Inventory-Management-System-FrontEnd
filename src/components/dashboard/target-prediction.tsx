"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { stockLevelPrediction, StockLevelPredictionInput } from "@/ai/flows/stock-level-prediction";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  monthlyRevenue: z.coerce.number().min(0, "Monthly revenue must be positive."),
  totalProducts: z.coerce.number().int().min(1, "Must have at least one product."),
  stockAlerts: z.coerce.number().int().min(0, "Stock alerts cannot be negative."),
  currentInventoryValue: z.coerce.number().min(0, "Inventory value must be positive."),
});

type PredictionResult = {
  target: number;
  reasoning: string;
};

export default function TargetPrediction() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const form = useForm<StockLevelPredictionInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyRevenue: 45231,
      totalProducts: 1250,
      stockAlerts: 5,
      currentInventoryValue: 250430,
    },
  });

  const onSubmit: SubmitHandler<StockLevelPredictionInput> = async (data) => {
    setLoading(true);
    setPrediction(null);
    try {
      const result = await stockLevelPrediction(data);
      setPrediction({
        target: result.targetStockRefillValue,
        reasoning: result.reasoning,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "The AI model failed to generate a prediction. Please try again later.",
      })
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  const currentInventoryValue = form.watch("currentInventoryValue");
  const progress = prediction ? (currentInventoryValue / prediction.target) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI Target Prediction</CardTitle>
        <CardDescription>Get AI-powered suggestions for inventory reordering.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="monthlyRevenue" render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Revenue ($)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="totalProducts" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Products</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="stockAlerts" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Alerts</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="currentInventoryValue" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Inventory ($)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Prediction
            </Button>
          </form>
        </Form>
        
        {prediction && (
            <div className="space-y-4 pt-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <h4 className="font-semibold">Target Stock Refill Value</h4>
                        <span className="font-bold text-primary text-lg">
                            ${prediction.target.toLocaleString()}
                        </span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <div className="text-xs text-muted-foreground mt-1">
                        Current: ${currentInventoryValue.toLocaleString()}
                    </div>
                </div>
                <Alert>
                    <AlertTitle className="font-semibold">AI Reasoning</AlertTitle>
                    <AlertDescription className="text-sm">{prediction.reasoning}</AlertDescription>
                </Alert>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
