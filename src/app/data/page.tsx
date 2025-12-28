
"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { getColumns } from "@/components/data-table-columns";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Database, UserCog, Award } from "lucide-react";
import type { Grievance, User, Badge as BadgeType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const UserStats = ({ user, userData }: { user: any, userData: User | null }) => {
  if (!userData) return null;

  return (
     <div className="mb-12 animate-slide-in-up">
        <div className="text-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold">Welcome, {userData.name}!</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Resolved</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {userData.totalResolvedContributions || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        issues you reported have been resolved
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Your Badges</CardTitle>
                </CardHeader>
                <CardContent>
                    {userData.badges && userData.badges.length > 0 ? (
                        <div className="flex items-center gap-2">
                             <TooltipProvider>
                                {userData.badges.slice(0, 5).map((badge, index) => (
                                <Tooltip key={index}>
                                    <TooltipTrigger>
                                        <span className="text-2xl cursor-default">🏅</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">{badge.title}</p>
                                        <p>{badge.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                                ))}
                            </TooltipProvider>
                            {userData.badges.length > 5 && (
                                <span className="text-sm text-muted-foreground">+{userData.badges.length - 5} more</span>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No badges earned yet. Report issues to start!</p>
                    )}
                </CardContent>
            </Card>
        </div>
     </div>
  )
}

export default function DataPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userData, isLoading: isUserDocLoading } = useDoc<User>(userDocRef);
  const isAdmin = userData?.role === 'admin';

  const grievancesQuery = useMemoFirebase(
    () => {
      if (!firestore || !user) return null;
      if (isAdmin) {
        // Admin sees all grievances
        return query(collection(firestore, `grievances`));
      } else {
        // Regular user sees only their grievances
        return query(collection(firestore, `grievances`), where("userId", "==", user.uid));
      }
    },
    [firestore, user, isAdmin]
  );
  const { data: grievances, isLoading: isGrievancesLoading } = useCollection<Grievance>(grievancesQuery);
  
  // Fetch all users if admin, to map userId to name
  const usersQuery = useMemoFirebase(() => (firestore && isAdmin ? query(collection(firestore, 'users')) : null), [firestore, isAdmin]);
  const { data: usersData, isLoading: areUsersLoading } = useCollection<User>(usersQuery);

  const userMap = useMemo(() => {
    if (!usersData) return new Map<string, string>();
    return new Map(usersData.map(u => [u.id, u.name]));
  }, [usersData]);

  const columns = useMemo(() => getColumns(isAdmin, userMap), [isAdmin, userMap]);
  const isLoading = isUserDocLoading || isGrievancesLoading || (isAdmin && areUsersLoading);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in">
      {!isAdmin && user && <UserStats user={user} userData={userData as User | null} />}
      <div className="text-center mb-12">
        {isAdmin ? (
            <UserCog className="mx-auto h-12 w-12 text-primary mb-4" />
        ) : (
            <Database className="mx-auto h-12 w-12 text-primary mb-4" />
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-primary">{isAdmin ? "Admin Dashboard" : "My Grievances"}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {isAdmin ? "Review and manage all reported grievances." : "Track the status of all your reported grievances."}
        </p>
      </div>
      <Card className="shadow-lg animate-slide-in-up">
        <CardHeader>
            <CardTitle>{isAdmin ? "All Reported Grievances" : "My Reported Grievances"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !grievances ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-[250px]" />
                  <Skeleton className="h-10 w-[100px]" />
              </div>
              <Skeleton className="h-[50vh] w-full rounded-md" />
              <div className="flex items-center justify-end gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ) : user ? (
            <DataTable columns={columns} data={grievances || []} />
          ) : (
            <p className="text-center text-muted-foreground py-16">Please log in to view grievances.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
