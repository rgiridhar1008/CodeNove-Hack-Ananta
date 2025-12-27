
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { collection } from "firebase/firestore";

const grievanceSchema = z.object({
  issueType: z.string().min(1, "Issue type is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  // location will be handled separately
});

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Submitting..." : "Submit Grievance"}
    </Button>
  );
}

export function GrievanceForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    if (!user || !firestore) {
      return { ...prevState, message: "You must be logged in to submit a grievance." };
    }

    const validatedFields = grievanceSchema.safeParse({
      issueType: formData.get("issueType"),
      description: formData.get("description"),
    });

    if (!validatedFields.success) {
      return {
        ...prevState,
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Validation failed.",
        success: false,
      };
    }

    try {
      const grievancesCollection = collection(firestore, "grievances");
      await addDocumentNonBlocking(grievancesCollection, {
        userId: user.uid,
        issueType: validatedFields.data.issueType,
        description: validatedFields.data.description,
        latitude: 0, // Placeholder
        longitude: 0, // Placeholder
        status: "Pending",
        createdAt: new Date(),
      });

      formRef.current?.reset();
      return {
        ...prevState,
        message: "Grievance submitted successfully!",
        errors: {},
        success: true,
      };
    } catch (error) {
      console.error("Grievance submission error:", error);
      return {
        ...prevState,
        message: "An unexpected error occurred. Please try again.",
        success: false,
      };
    }
  }, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Success!",
        description: state.message,
        className: "bg-accent text-accent-foreground",
      });
    } else if (state.message && !state.success && Object.keys(state.errors).length > 0) {
      const errorMsg = Object.values(state.errors).flat().join(' ');
      toast({
        title: "Error",
        description: errorMsg || state.message,
        variant: "destructive",
      });
    } else if (state.message && !state.success) {
         toast({
            title: "Error",
            description: state.message,
            variant: "destructive",
        })
    }
  }, [state, toast]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Grievance Details</CardTitle>
        <CardDescription>
          Please provide details about the issue. Location pinning will be available soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label>Issue Type</Label>
            <Select name="issueType">
                <SelectTrigger>
                    <SelectValue placeholder="Select an issue type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Pothole">Pothole</SelectItem>
                    <SelectItem value="Street Light">Street Light</SelectItem>
                    <SelectItem value="Garbage">Garbage</SelectItem>
                    <SelectItem value="Water Leakage">Water Leakage</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
            {state.errors?.issueType && <p className="text-sm text-destructive">{state.errors.issueType[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Describe the issue in detail..."
            />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Upload Image (Optional)</Label>
            <Input type="file" disabled />
            <p className="text-xs text-muted-foreground">Image uploads are coming soon.</p>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
