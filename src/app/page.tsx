
"use client";

import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { FeatureCard } from '@/components/feature-card';
import Link from 'next/link';
import { BarChart, CheckCircle, ListChecks, ListTodo, MapPin, Timer, Users, Vote } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const stats = [
  {
    icon: ListChecks,
    value: '1,284',
    label: 'Issues Reported',
  },
  {
    icon: CheckCircle,
    value: '972',
    label: 'Issues Resolved',
  },
  {
    icon: Users,
    value: '25,000+',
    label: 'Active Citizens',
  },
  {
    icon: Timer,
    value: '7.2 Days',
    label: 'Avg. Resolution Time',
  },
];

const features = [
  {
    icon: MapPin,
    title: 'Geo-tagged Issue Reporting',
    description: 'Easily report civic issues by pinning them on a map for precise location tracking.',
  },
  {
    icon: ListTodo,
    title: 'Transparent Tracking',
    description: 'Follow the progress of your reported issues from submission to resolution in real-time.',
  },
  {
    icon: Vote,
    title: 'Community Voting',
    description: 'Participate in local decision-making by voting on polls and community proposals.',
  },
  {
    icon: BarChart,
    title: 'Data-Driven Insights',
    description: 'Access analytics and reports to understand civic trends and government performance.',
  },
];

const WelcomeMessage = () => {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const userDocRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
    const { data: userData, isLoading: isUserDataLoading } = useDoc<User>(userDocRef);

    if (isUserLoading || isUserDataLoading) {
        return <Skeleton className="h-12 w-80" />;
    }

    if (!user || !userData) {
        return null;
    }
    
    const welcomeText = userData.role === 'admin'
        ? `Welcome Admin, ${userData.name}!`
        : `Welcome, ${userData.name}!`;

    return <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">{welcomeText}</h2>;
}


export default function Home() {
  const { user } = useUser();
  
  return (
    <div className="flex flex-col animate-fade-in">
      <section className="w-full bg-card py-20 md:py-32 lg:py-40">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto animate-slide-in-up">
            {user ? (
                <WelcomeMessage />
            ) : (
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-primary">
                Empowering Citizens. Improving Governance.
                </h1>
            )}
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Civix is your platform to report local issues, participate in governance, and build a better community together.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login?redirect=/feedback">Report an Issue</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/issue-map">Explore Issue Map</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <section id="features" className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">A Platform for Change</h2>
            <p className="mt-2 text-muted-foreground md:text-lg">Key features designed for modern civic engagement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} animationDelay={index * 150} />
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="w-full py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} icon={stat.icon} value={stat.value} label={stat.label} animationDelay={index * 150} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
