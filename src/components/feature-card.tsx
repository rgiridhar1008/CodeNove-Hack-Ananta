import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  animationDelay?: number;
}

export function FeatureCard({ icon: Icon, title, description, animationDelay = 0 }: FeatureCardProps) {
  return (
    <Card 
        className="text-center shadow-md hover:shadow-lg transition-shadow duration-300 animate-slide-in-up"
        style={{ animationDelay: `${animationDelay}ms`}}
    >
      <CardHeader>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
