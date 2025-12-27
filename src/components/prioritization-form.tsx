
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { getPrioritization } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp } from "lucide-react";

const initialState = {
  message: "",
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Analyzing..." : "Prioritize Issue"}
      <Sparkles className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function PrioritizationForm() {
  const [state, formAction] = useActionState(getPrioritization, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && state.errors && Object.keys(state.errors).length > 0) {
      const errorMsg = Object.values(state.errors).flat().join(' ');
      toast({
        title: "Error",
        description: errorMsg || state.message,
        variant: "destructive"
      });
    } else if (state.message && !state.data) {
        toast({
            title: "Error",
            description: state.message,
            variant: "destructive"
        })
    }
  }, [state, toast]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
          <CardDescription>Provide the details of the issue to be analyzed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issueDescription">Issue Description</Label>
              <Textarea id="issueDescription" name="issueDescription" placeholder="e.g., Recurring flooding at the intersection of Main St and 1st Ave." />
              {state.errors?.issueDescription && <p className="text-sm text-destructive">{state.errors.issueDescription}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="citizenFeedback">Citizen Feedback Summary</Label>
              <Textarea id="citizenFeedback" name="citizenFeedback" placeholder="e.g., Multiple complaints received via social media and city portal. Residents report traffic delays and property damage risk." />
              {state.errors?.citizenFeedback && <p className="text-sm text-destructive">{state.errors.citizenFeedback}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="criticalFactors">Critical Factors</Label>
              <Textarea id="criticalFactors" name="criticalFactors" placeholder="e.g., Proximity to hospital, upcoming major city event, recent news coverage." />
              {state.errors?.criticalFactors && <p className="text-sm text-destructive">{state.errors.criticalFactors}</p>}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg flex flex-col">
        <CardHeader>
          <CardTitle>AI Analysis Result</CardTitle>
          <CardDescription>The AI-generated priority and rationale will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          {state.data ? (
            <div className="space-y-4 text-center">
                <div className="flex justify-center items-baseline gap-2">
                    <TrendingUp className="h-10 w-10 text-primary" />
                    <span className="text-6xl font-bold text-primary">{state.data.priorityScore}</span>
                </div>
                <p className="text-2xl font-semibold">Priority Level: <span className="text-primary">{state.data.priorityLevel}</span></p>
                <div>
                    <h4 className="font-semibold text-lg">Rationale:</h4>
                    <p className="text-muted-foreground">{state.data.rationale}</p>
                </div>
            </div>
          ) : (
             <div className="text-center text-muted-foreground p-8">
                <Sparkles className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Awaiting issue details for analysis.</p>
             </div>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">This is an AI-generated recommendation. Please review carefully before taking action.</p>
         </CardFooter>
      </Card>
    </div>
  );
}
