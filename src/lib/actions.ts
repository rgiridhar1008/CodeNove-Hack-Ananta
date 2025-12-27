
"use server";

import { z } from "zod";
import { prioritizeIssue } from "@/ai/flows/issue-prioritization";

// This file is largely a placeholder for now as the grievance form has its own server action logic.
// It is kept for the AI prioritization action.

// Prioritization Form
const prioritizationSchema = z.object({
    issueDescription: z.string().min(1, "Issue description is required."),
    citizenFeedback: z.string().min(1, "Citizen feedback is required."),
    criticalFactors: z.string().min(1, "Critical factors are required."),
});

export async function getPrioritization(prevState: any, formData: FormData) {
    const validatedFields = prioritizationSchema.safeParse({
        issueDescription: formData.get("issueDescription"),
        citizenFeedback: formData.get("citizenFeedback"),
        criticalFactors: formData.get("criticalFactors"),
    });

    if (!validatedFields.success) {
        return {
          ...prevState,
          errors: validatedFields.error.flatten().fieldErrors,
          message: "Validation failed.",
        };
    }
    
    try {
        const result = await prioritizeIssue(validatedFields.data);
        return {
            ...prevState,
            errors: {},
            message: "Prioritization complete.",
            data: result,
        };
    } catch (error) {
        console.error(error);
        return {
            ...prevState,
            errors: {},
            message: "An error occurred while prioritizing the issue.",
        };
    }
}
