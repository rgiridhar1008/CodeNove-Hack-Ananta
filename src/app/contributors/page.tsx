
"use client";

import { ContributorCard } from "@/components/contributor-card";
import { StatCard } from "@/components/stat-card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Contributor } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GitCommit, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "83",
    label: "Contributors",
  },
  {
    icon: GitCommit,
    value: "877",
    label: "Total Contributions",
  },
  {
    icon: Star,
    value: "373",
    label: "Top Contributions",
  },
];

export default function ContributorsPage() {
  const firestore = useFirestore();
  const contributorsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, "contributors")) : null),
    [firestore]
  );
  const { data: contributors, isLoading } = useCollection<Contributor>(contributorsQuery);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Our Amazing Contributors</h1>
        <p className="mt-4 text-lg text-muted-foreground">Meet the talented developers making Civix better every day.</p>
      </div>

      <section id="stats" className="w-full mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} icon={stat.icon} value={stat.value} label={stat.label} animationDelay={index * 150} />
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))
        ) : (
          contributors?.map((contributor, index) => (
            <ContributorCard key={contributor.id} contributor={contributor} animationDelay={index * 150}/>
          ))
        )}
      </div>
    </div>
  );
}
