import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "destructive";
}

export default function StatCard({ title, value, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", { "text-destructive": variant === "destructive" })} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", { "text-destructive": variant === "destructive" })}>{value}</div>
      </CardContent>
    </Card>
  );
}
