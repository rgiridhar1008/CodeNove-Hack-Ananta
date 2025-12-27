
"use client";

import { useMemo, useEffect } from "react";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, doc, updateDoc, where } from "firebase/firestore";
import { UserCog, ShieldAlert, ShieldCheck } from "lucide-react";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


export default function AdminPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => (firestore && currentUser ? doc(firestore, 'users', currentUser.uid) : null), [firestore, currentUser]);
  const { data: currentUserData, isLoading: isUserDocLoading } = useDoc<User>(userDocRef);
  const isAdmin = currentUserData?.role === 'admin';

  const usersQuery = useMemoFirebase(
    () => (firestore && isAdmin ? query(collection(firestore, "users")) : null),
    [firestore, isAdmin]
  );
  const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);

  useEffect(() => {
    // Redirect non-admin users only after we have confirmed their role (or lack thereof).
    // This prevents premature redirection while user data is still loading.
    if (!isUserDocLoading && currentUserData && !isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to view this page.",
      });
      router.push('/');
    }
  }, [isUserDocLoading, currentUserData, isAdmin, router, toast]);

  const handleRoleChange = async (targetUser: User, newRole: 'admin' | 'citizen') => {
    if (!firestore || !isAdmin) return;

    if (targetUser.id === currentUser?.uid) {
        toast({
            variant: "destructive",
            title: "Action Forbidden",
            description: "You cannot change your own role.",
        });
        return;
    }

    const targetUserRef = doc(firestore, "users", targetUser.id);
    try {
        await updateDoc(targetUserRef, { role: newRole });
        toast({
            title: "Success!",
            description: `${targetUser.name || targetUser.email}'s role has been updated to ${newRole}.`,
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to update role: ${error.message}`,
        });
    }
  };

  // Render a loading state while we verify permissions.
  if (isUserDocLoading) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in text-center">
            <p>Verifying permissions...</p>
        </div>
    )
  }
  
  // If loading is finished and the user is confirmed not to be an admin, render nothing
  // while the redirect initiated by the useEffect takes place.
  if (!isAdmin) {
      return null;
  }

  // At this point, the user is confirmed to be an admin.
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in">
      <div className="text-center mb-12">
        <UserCog className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Admin Management</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manage user roles and permissions.
        </p>
      </div>
      <Card className="shadow-lg animate-slide-in-up">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Add or remove admin privileges for users.</CardDescription>
        </CardHeader>
        <CardContent>
          {areUsersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[50vh] w-full rounded-md" />
            </div>
          ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users?.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>{user.name || 'N/A'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {user.role}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                {user.role === 'admin' ? (
                                    <Button variant="outline" size="sm" onClick={() => handleRoleChange(user, 'citizen')}>
                                        <ShieldAlert className="mr-2 h-4 w-4" />
                                        Remove Admin
                                    </Button>
                                ) : (
                                    <Button variant="default" size="sm" onClick={() => handleRoleChange(user, 'admin')}>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Make Admin
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
