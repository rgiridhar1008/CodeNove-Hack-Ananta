
"use client";

import { useState } from "react";
import { PollChart } from "@/components/poll-chart";
import { CreatePollForm } from "@/components/create-poll-form";
import { VotingStatCard } from "@/components/voting-stat-card";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, doc, where } from "firebase/firestore";
import type { Poll, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ListChecks, Users, TrendingUp, Vote, BarChart, PlusSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PollAnalyticsDashboard } from "@/components/poll-analytics-dashboard";

const stats = [
  {
    icon: ListChecks,
    value: "0",
    label: "Active Polls",
    background: "from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50",
  },
  {
    icon: Users,
    value: "0",
    label: "Total Votes",
    background: "from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50",
  },
  {
    icon: TrendingUp,
    value: "0%",
    label: "Engagement",
    background: "from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50",
  },
];

export default function VotingPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("browse");

  const userDocRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userData, isLoading: isUserLoading } = useDoc<User>(userDocRef);
  const isAdmin = userData?.role === 'admin';

  const pollsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, "polls")) : null),
    [firestore]
  );
  const { data: polls, isLoading: arePollsLoading } = useCollection<Poll>(pollsQuery);

  const activePollsCount = polls?.filter(p => p.status === 'Active').length || 0;
  stats[0].value = arePollsLoading ? "..." : activePollsCount.toString();
  
  const totalVotes = polls?.reduce((acc, poll) => acc + poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0), 0) || 0;
  stats[1].value = arePollsLoading ? "..." : totalVotes.toLocaleString();
  
  // Placeholder for engagement
  stats[2].value = arePollsLoading ? "..." : "12%"; 

  const isLoading = isUserLoading || arePollsLoading;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in">
      <div className="text-center mb-12 animate-slide-in-up">
        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tighter">Community Voting</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Create polls, vote, and view results to shape your community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
              <VotingStatCard key={index} icon={stat.icon} value={stat.value} label={stat.label} background={stat.background} animationDelay={index * 150} />
          ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-slide-in-up" style={{animationDelay: '450ms'}}>
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} max-w-2xl mx-auto h-12`}>
          <TabsTrigger value="browse" className="h-10 text-base"><ListChecks className="mr-2 h-5 w-5"/>Browse Polls</TabsTrigger>
          {isAdmin && <TabsTrigger value="create" className="h-10 text-base"><PlusSquare className="mr-2 h-5 w-5"/>Create Poll</TabsTrigger>}
          <TabsTrigger value="analytics" className="h-10 text-base"><BarChart className="mr-2 h-5 w-5"/>Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <Card className="mt-6">
            <CardContent className="p-4 md:p-6">
                <div className="space-y-12">
                    {isLoading ? (
                        Array.from({ length: 2 }).map((_, index) => (
                            <Skeleton key={index} className="h-96 w-full rounded-lg" />
                        ))
                    ) : polls && polls.length > 0 ? (
                        polls?.map((poll, index) => (
                            <PollChart key={poll.id} poll={poll} isAdmin={isAdmin} animationDelay={index * 150} />
                        ))
                    ) : (
                        <div className="text-center py-20 flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-6">
                                <Vote className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">No polls yet</h3>
                            <p className="text-muted-foreground mb-6">{isAdmin ? "Create the first poll to get started!" : "No active polls at the moment. Please check back later."}</p>
                            {isAdmin && (
                                <Button onClick={() => setActiveTab("create")}>
                                    <PlusSquare className="mr-2 h-5 w-5"/>
                                    Create Poll
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        {isAdmin && (
          <TabsContent value="create">
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Create a New Poll</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreatePollForm />
                </CardContent>
             </Card>
          </TabsContent>
        )}
        <TabsContent value="analytics">
            <PollAnalyticsDashboard polls={polls || []} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
