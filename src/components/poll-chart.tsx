
"use client";

import { useState, useMemo, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Poll, Vote } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, runTransaction, serverTimestamp, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PollChartProps {
  poll: Poll;
  isAdmin: boolean;
  animationDelay?: number;
}

export function PollChart({ poll, isAdmin, animationDelay = 0 }: PollChartProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Check if the current user has already voted on this poll
  const voteRef = useMemoFirebase(() => (firestore && user ? doc(firestore, `polls/${poll.id}/votes/${user.uid}`) : null), [firestore, user, poll.id]);
  const { data: userVote, isLoading: isVoteLoading } = useDoc<Vote>(voteRef);

  const hasVoted = !!userVote;
  const isPollActive = poll.status === 'Active';

  const handleDeletePoll = () => {
    if (!firestore || !isAdmin) return;
    setIsAlertOpen(false);

    const pollRef = doc(firestore, "polls", poll.id);
    deleteDoc(pollRef).then(() => {
        toast({
            title: "Poll Deleted",
            description: "The poll has been successfully removed.",
        });
    }).catch((error) => {
        console.error("Error deleting poll:", error);
        const permissionError = new FirestorePermissionError({
            path: pollRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "You do not have permission to delete this poll."
        });
    });
  };

  const handleVote = () => {
    if (!firestore || !user || !selectedOptionId) return;

    setIsSubmitting(true);
    
    const pollRef = doc(firestore, "polls", poll.id);
    const userVoteRef = doc(firestore, `polls/${poll.id}/votes`, user.uid);
    const voteData: Omit<Vote, 'id'> = {
        pollId: poll.id,
        voterId: user.uid,
        selectedOption: selectedOptionId,
        votedAt: serverTimestamp(),
    };

    runTransaction(firestore, async (transaction) => {
      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists()) {
        throw "Poll does not exist!";
      }

      const existingVoteDoc = await transaction.get(userVoteRef);
      if (existingVoteDoc.exists()) {
        toast({ variant: "destructive", title: "Already Voted", description: "You have already cast your vote for this poll." });
        // By returning, we stop the transaction without throwing an error, as this is a valid state.
        return; 
      }

      const newOptions = pollDoc.data().options.map((option: any) => {
        if (option.id === selectedOptionId) {
          return { ...option, votes: option.votes + 1 };
        }
        return option;
      });

      transaction.update(pollRef, { options: newOptions });
      transaction.set(userVoteRef, voteData);
    }).then(() => {
        // This will only run if the transaction is successful and didn't hit the early return.
        if (!hasVoted) {
            toast({ title: "Vote Cast!", description: "Your vote has been successfully recorded." });
        }
    }).catch((error: any) => {
        console.error("Voting transaction failed: ", error);
        const permissionError = new FirestorePermissionError({
            path: userVoteRef.path,
            operation: 'create',
            requestResourceData: voteData
        });
        errorEmitter.emit('permission-error', permissionError);

        toast({
            variant: "destructive",
            title: "Vote Failed",
            description: error.message || "Could not cast your vote due to a permission error.",
        });
    }).finally(() => {
        setIsSubmitting(false);
    });
  };
  
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    poll.options.forEach((option, index) => {
        const chartColorVar = `var(--chart-${(index % 5) + 1})`;
        config[option.label] = {
            label: option.label,
            color: `hsl(${chartColorVar})`,
        };
    });
    return { ...config, votes: { label: "Votes" } };
  }, [poll.options]);

  const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);

  const chartData = poll.options.map(option => ({
    label: option.label,
    votes: option.votes,
    fill: chartConfig[option.label]?.color as string,
  }));

  const showResults = hasVoted || !isPollActive;

  return (
    <>
        <Card 
            className="overflow-hidden shadow-lg animate-slide-in-up"
            style={{ animationDelay: `${animationDelay}ms`}}
        >
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <CardTitle className="text-2xl">{poll.title}</CardTitle>
                    <CardDescription>{poll.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isPollActive ? 'default' : 'secondary'} className={cn(!isPollActive && 'bg-muted text-muted-foreground')}>
                        {poll.status}
                    </Badge>
                    {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => setIsAlertOpen(true)}>
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-8 items-center">
            {!showResults ? (
                <div className="space-y-4">
                    <h3 className="font-semibold">Cast Your Vote</h3>
                    <RadioGroup
                    onValueChange={setSelectedOptionId}
                    disabled={!isPollActive || hasVoted || isVoteLoading}
                    >
                    {poll.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`${poll.id}-${option.id}`} />
                        <Label htmlFor={`${poll.id}-${option.id}`}>{option.label}</Label>
                        </div>
                    ))}
                    </RadioGroup>
                    <Button onClick={handleVote} disabled={!selectedOptionId || !isPollActive || hasVoted || isVoteLoading || isSubmitting}>
                        {isSubmitting ? "Submitting..." : (hasVoted ? "Already Voted" : "Vote")}
                    </Button>
                    {isVoteLoading && <p className="text-sm text-muted-foreground">Checking your vote...</p>}
                </div>
            ) : (
                <div className="space-y-2">
                    <h3 className="font-semibold">Results</h3>
                    {chartData.map(item => (
                        <div key={item.label} className="grid gap-1">
                            <div className="flex justify-between items-center text-sm">
                                <span>{item.label}</span>
                                <span>{totalVotes > 0 ? ((item.votes / totalVotes) * 100).toFixed(0) : 0}% ({item.votes})</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                            <div className="h-2 rounded-full" style={{ width: `${totalVotes > 0 ? (item.votes / totalVotes) * 100 : 0}%`, backgroundColor: item.fill }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="h-[250px] w-full">
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="label"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                            width={150}
                            />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                            />
                        <Bar dataKey="votes" radius={4}>
                            {chartData.map((entry, index) => (
                                <div key={`cell-${index}`} style={{ backgroundColor: entry.fill }} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </div>
            </div>
        </CardContent>
        <CardFooter>
            <p className="text-sm text-muted-foreground">Total Votes: {totalVotes.toLocaleString()}</p>
        </CardFooter>
        </Card>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this poll and all associated votes.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePoll} className={cn(Button, "bg-destructive hover:bg-destructive/90")}>
                    Delete
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
