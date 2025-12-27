
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Grievance, GrievanceStatus, IssueCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IssueMapView } from "./issue-map-view";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

const statusColors: Record<GrievanceStatus, string> = {
  Pending: "bg-yellow-500",
  "In Progress": "bg-blue-500",
  Resolved: "bg-green-500",
};

// Hardcoded categories for consistency
const issueCategories: IssueCategory[] = [
    { id: "pothole", name: "Pothole" },
    { id: "street-light", name: "Street Light" },
    { id: "garbage", name: "Garbage" },
    { id: "water-leak", name: "Water Leak" },
    { id: "other", name: "Other" },
];

interface IssueCardProps {
  issue: Grievance;
  onSelect: (issue: Grievance) => void;
  isSelected: boolean;
}

function IssueCard({ issue, onSelect, isSelected }: IssueCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected ? "border-primary ring-2 ring-primary" : ""
      )}
      onClick={() => onSelect(issue)}
    >
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-md flex-1">{issue.issueType}</CardTitle>
          <Badge
            className={cn(
              "text-white whitespace-nowrap",
              statusColors[issue.status]
            )}
          >
            {issue.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 pt-1 break-all">{issue.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

interface IssueMapClientProps {
  initialIssues: Grievance[];
}

export function IssueMapClient({ initialIssues }: IssueMapClientProps) {
  const [statusFilter, setStatusFilter] = useState<GrievanceStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string | "All">("All");
  const [selectedIssue, setSelectedIssue] = useState<Grievance | null>(initialIssues[0] || null);

  const filteredIssues = useMemo(() => {
    return initialIssues.filter((issue) => {
      const statusMatch = statusFilter === "All" || issue.status === statusFilter;
      const categoryMatch = categoryFilter === "All" || issue.issueType === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [initialIssues, statusFilter, categoryFilter]);
  
  const statuses = ["All", "Pending", "In Progress", "Resolved"] as const;

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="grid md:grid-cols-[350px_1fr] min-h-[70vh]">
        <div className="flex flex-col p-4 border-r bg-card">
          <h2 className="text-xl font-bold mb-4">Filters & Issues</h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Select onValueChange={(v) => setStatusFilter(v as GrievanceStatus | "All")} defaultValue="All">
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => setCategoryFilter(v as string | "All")} defaultValue="All">
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="All">All Categories</SelectItem>
                 {issueCategories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="flex-1 -mr-4">
            <div className="space-y-2 pr-4">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onSelect={setSelectedIssue}
                    isSelected={selectedIssue?.id === issue.id}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center pt-8">No issues match the current filters.</p>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="relative bg-muted/50 overflow-hidden">
            <IssueMapView 
                issues={filteredIssues} 
                selectedIssue={selectedIssue} 
                onSelectIssue={setSelectedIssue} 
            />
        </div>
      </div>
    </Card>
  );
}
