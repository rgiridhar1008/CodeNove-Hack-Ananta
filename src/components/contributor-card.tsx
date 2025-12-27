import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import type { Contributor } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ContributorCardProps {
  contributor: Contributor;
  animationDelay?: number;
}

export function ContributorCard({ contributor, animationDelay = 0 }: ContributorCardProps) {
  const fallback = contributor.name.charAt(0);
  return (
    <Card 
      className="text-center transition-all transform hover:scale-105 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: `${animationDelay}ms`}}
    >
      <CardHeader className="items-center">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarImage src={contributor.avatar} alt={contributor.name} data-ai-hint="person portrait" />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-xl">{contributor.name}</CardTitle>
        <p className="text-primary font-medium">{contributor.role}</p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="ghost" size="icon" asChild>
          <Link href={contributor.githubUrl} target="_blank" aria-label={`${contributor.name}'s GitHub`}>
            <Github className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
