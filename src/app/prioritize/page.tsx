import { PrioritizationForm } from "@/components/prioritization-form";
import { Lightbulb } from "lucide-react";

export default function PrioritizePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Lightbulb className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">AI Issue Prioritization</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Leverage AI to analyze citizen feedback and critical factors for effective resource allocation.
          </p>
        </div>
        <div className="animate-slide-in-up">
          <PrioritizationForm />
        </div>
      </div>
    </div>
  );
}
