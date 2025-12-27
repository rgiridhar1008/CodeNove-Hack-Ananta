
"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Poll } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PollChartProps {
  poll: Poll;
  animationDelay?: number;
}

const chartConfig = {
  votes: {
    label: "Votes",
    color: "hsl(var(--primary))",
  },
  option: {
    label: "Option",
  },
};

export function PollChart({ poll, animationDelay = 0 }: PollChartProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);

  const chartData = poll.options.map(option => ({
    ...option
  }));

  return (
    <Card 
        className="overflow-hidden shadow-lg animate-slide-in-up"
        style={{ animationDelay: `${animationDelay}ms`}}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <Badge variant={poll.status === 'Active' ? 'default' : 'secondary'} className={cn(poll.status === 'Active' && 'bg-accent text-accent-foreground')}>
            {poll.status}
          </Badge>
        </div>
        <CardDescription>{poll.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="font-semibold">Cast Your Vote</h3>
            <RadioGroup
              onValueChange={setSelectedOption}
              disabled={poll.status === "Closed"}
            >
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`${poll.id}-${option.id}`} />
                  <Label htmlFor={`${poll.id}-${option.id}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <Button disabled={!selectedOption || poll.status === "Closed"}>
              Vote
            </Button>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={chartConfig}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 30 }}>
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
                  <Bar dataKey="votes" radius={4} fill="var(--color-votes)" />
                </BarChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">Total Votes: {totalVotes.toLocaleString()}</p>
      </CardFooter>
    </Card>
  );
}
