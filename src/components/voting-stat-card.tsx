
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VotingStatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  background: string;
  animationDelay?: number;
}

export function VotingStatCard({ icon: Icon, value, label, background, animationDelay = 0 }: VotingStatCardProps) {
  return (
    <Card 
        className={cn(
            "text-foreground transition-transform transform hover:-translate-y-2 animate-slide-in-up overflow-hidden",
            "bg-gradient-to-br",
            background
        )}
        style={{ animationDelay: `${animationDelay}ms`}}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-5 w-5 text-foreground/80" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
