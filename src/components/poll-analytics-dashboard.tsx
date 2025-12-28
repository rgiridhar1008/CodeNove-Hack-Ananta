
"use client";

import { useMemo } from 'react';
import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { Poll } from "@/lib/types";
import { BarChart, Users, Vote } from 'lucide-react';

interface PollAnalyticsDashboardProps {
  polls: Poll[];
  isLoading: boolean;
}

const chartConfig = {
  active: {
    label: "Active",
    color: "hsl(var(--chart-1))",
  },
  closed: {
    label: "Closed",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function PollAnalyticsDashboard({ polls, isLoading }: PollAnalyticsDashboardProps) {

  const stats = useMemo(() => {
    if (isLoading) {
      return { totalPolls: 0, totalVotes: 0, engagementRate: 0 };
    }
    const totalPolls = polls.length;
    const totalVotes = polls.reduce((acc, poll) => acc + poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0), 0);
    const engagementRate = totalPolls > 0 ? (totalVotes / totalPolls) : 0;
    return {
      totalPolls,
      totalVotes,
      engagementRate: engagementRate.toFixed(1),
    };
  }, [polls, isLoading]);

  const pollStatusData = useMemo(() => {
    if (isLoading) return [];
    const activeCount = polls.filter(p => p.status === 'Active').length;
    const closedCount = polls.filter(p => p.status === 'Closed').length;
    return [
      { name: 'Active', value: activeCount, fill: "hsl(var(--chart-1))" },
      { name: 'Closed', value: closedCount, fill: "hsl(var(--chart-2))" },
    ];
  }, [polls, isLoading]);

  if (isLoading) {
    return (
        <Card className="mt-6">
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <div className="lg:col-span-3">
                    <Skeleton className="h-64 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  if (polls.length === 0) {
    return (
        <Card className="mt-6">
            <CardContent className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                 <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-6">
                    <BarChart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No Data Available</h3>
                <p>Create your first poll to see analytics here.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Poll Analytics</CardTitle>
        <CardDescription>An overview of community engagement and poll performance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPolls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVotes.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Votes Per Poll</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.engagementRate}</div>
            </CardContent>
          </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Poll Status Breakdown</CardTitle>
                <CardDescription>A look at active versus closed polls.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                    <PieChart>
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                            />
                        <Pie data={pollStatusData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                             {pollStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
