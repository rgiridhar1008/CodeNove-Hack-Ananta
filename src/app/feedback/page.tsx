
import { GrievanceForm } from "@/components/grievance-form";
import { AlertTriangle } from "lucide-react";

export default function ReportGrievancePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Report a Grievance</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Encounter an issue? Let us know by filling out the form below.
          </p>
        </div>
        <div className="animate-slide-in-up">
          <GrievanceForm />
        </div>
      </div>
    </div>
  );
}

    