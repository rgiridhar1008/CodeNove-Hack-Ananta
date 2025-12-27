
"use client";

import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Grievance } from "@/lib/types";
import { IssueMapClient } from "@/components/issue-map-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Map } from "lucide-react";

export default function IssueMapPage() {
  const firestore = useFirestore();

  const grievancesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'grievances')) : null),
    [firestore]
  );
  const { data: grievances, isLoading } = useCollection<Grievance>(grievancesQuery);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in">
      <div className="text-center mb-12">
        <Map className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Civic Issues Map</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore civic issues across your region. Click markers for details, apply filters, and switch between map views.
        </p>
      </div>
      <div className="animate-slide-in-up">
        {isLoading ? (
          <Skeleton className="h-[70vh] w-full rounded-lg" />
        ) : (
          <IssueMapClient initialIssues={grievances || []} />
        )}
      </div>
    </div>
  );
}
