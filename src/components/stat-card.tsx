import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  animationDelay?: number;
}

export function StatCard({ icon: Icon, value, label, animationDelay = 0 }: StatCardProps) {
  return (
    <Card 
        className="text-center transition-transform transform hover:-translate-y-2 animate-slide-in-up"
        style={{ animationDelay: `${animationDelay}ms`}}
    >
      <CardHeader className="pb-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
