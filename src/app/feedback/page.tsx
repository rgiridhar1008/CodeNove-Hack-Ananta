
'use client';

import { GrievanceForm } from "@/components/grievance-form";
import { AlertTriangle } from "lucide-react";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const GrievanceFormWithNoSSR = dynamic(() => import('@/components/grievance-form').then(mod => mod.GrievanceForm), { 
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
});

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
          <GrievanceFormWithNoSSR />
        </div>
      </div>
    </div>
  );
}
