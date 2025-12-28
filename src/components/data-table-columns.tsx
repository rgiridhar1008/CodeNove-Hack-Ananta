
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Trash2, Award, Image as ImageIcon } from "lucide-react"
import { doc, updateDoc, serverTimestamp, deleteDoc, writeBatch, increment, arrayUnion } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { format, formatDistanceToNow } from 'date-fns';
import * as React from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Grievance, GrievanceStatus, GrievancePriority } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const statusColors: Record<GrievanceStatus, string> = {
  Pending: "bg-yellow-500",
  "In Progress": "bg-blue-500",
  Resolved: "bg-green-500",
};

const priorityColors: Record<GrievancePriority, string> = {
    Low: "bg-green-500",
    Medium: "bg-yellow-500",
    High: "bg-red-500",
};


const StatusUpdateDropdown = ({ grievance }: { grievance: Grievance }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);

    const updateStatus = (status: GrievanceStatus) => {
        if (!firestore) return;
        
        const grievanceRef = doc(firestore, "grievances", grievance.id);
        const batch = writeBatch(firestore);

        const updateData: any = { status };
        if (status === "Resolved") {
            updateData.resolvedAt = serverTimestamp();
        }
        
        batch.update(grievanceRef, updateData);

        // Badge Award Logic
        if (status === "Resolved" && !grievance.badgeAwarded) {
            const userRef = doc(firestore, "users", grievance.userId);
            const newBadge = {
                badgeId: "civic_contributor",
                title: "Civic Contributor",
                description: `For reporting an issue that was successfully resolved: "${grievance.issueType}"`,
                awardedAt: new Date(),
                grievanceId: grievance.id,
            };

            batch.update(userRef, {
                badges: arrayUnion(newBadge),
                totalResolvedContributions: increment(1)
            });

            batch.update(grievanceRef, { badgeAwarded: true });
        }


        batch.commit().then(() => {
            toast({
              title: `Status Updated to ${status}`,
              description: status === "Resolved" && !grievance.badgeAwarded 
                ? `A 'Civic Contributor' badge has been awarded to the user.`
                : `The user will be notified of the status change.`,
            });
        }).catch((error) => {
            console.error("Error updating status:", error);
            const permissionError = new FirestorePermissionError({
                path: grievanceRef.path,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "You do not have permission to update the status."
            });
        });
    }

    const handleDelete = () => {
        if (!firestore) return;
        setIsAlertOpen(false);
        const grievanceRef = doc(firestore, "grievances", grievance.id);
        deleteDoc(grievanceRef).then(() => {
            toast({
                title: "Grievance Deleted",
                description: "The issue has been successfully removed.",
            });
        }).catch((error) => {
            console.error("Error deleting grievance:", error);
            const permissionError = new FirestorePermissionError({
                path: grievanceRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "You do not have permission to delete this grievance."
            });
        });
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => updateStatus("Pending")}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus("In Progress")}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus("Resolved")}>Resolved</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        grievance and remove its data from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({ variant: "destructive" }))}>
                        Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export const getColumns = (isAdmin: boolean, userMap: Map<string, string>): ColumnDef<Grievance>[] => {
    const columns: ColumnDef<Grievance>[] = [
      {
        accessorKey: "issueType",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Issue Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const issueType = row.getValue("issueType") as string;
          const badgeAwarded = row.original.badgeAwarded;
          return (
            <div className="flex items-center gap-2">
              <span>{issueType}</span>
              {badgeAwarded && <span title="Badge awarded for this resolved issue">🏅</span>}
            </div>
          );
        },
      },
       {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.getValue("priority") as GrievancePriority;
          return <Badge className={cn("text-white", priorityColors[priority])}>{priority}</Badge>
        }
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as GrievanceStatus;
          const isOverdue = row.original.isOverdue;
          
          return (
            <div className="flex flex-col gap-2">
                <Badge className={cn("text-white w-fit", statusColors[status])}>{status}</Badge>
                {isOverdue && status !== 'Resolved' && <Badge variant="destructive">🔴 Overdue</Badge>}
            </div>
          )
        }
      },
      {
        accessorKey: "description",
        header: "Description",
      },
    ];

    if (isAdmin) {
        columns.push({
            accessorKey: "userId",
            header: "Reported By",
            cell: ({ row }) => {
                const userId = row.getValue("userId") as string;
                return userMap.get(userId) || "Unknown User";
            }
        });
    }
    
    columns.push(
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reported On
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as { toDate: () => Date } | undefined;
            return date ? new Date(date.toDate()).toLocaleDateString() : 'N/A';
        }
      },
      {
        accessorKey: "expectedResolutionDate",
        header: "Expected By",
        cell: ({ row }) => {
          const date = row.original.expectedResolutionDate as { toDate: () => Date } | undefined;
          if (!date) return 'N/A';
          const resolutionDate = date.toDate();
          return (
            <div className="flex flex-col">
              <span>{format(resolutionDate, "PP")}</span>
              <span className="text-xs text-muted-foreground">
                ({formatDistanceToNow(resolutionDate, { addSuffix: true })})
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "resolvedAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Resolved On
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
            const date = row.getValue("resolvedAt") as { toDate: () => Date } | undefined;
            return date ? new Date(date.toDate()).toLocaleDateString() : 'N/A';
        },
        enableHiding: true, // This column can be hidden
      }
    );

    if (isAdmin) {
        columns.push({
            id: "actions",
            cell: ({ row }) => <StatusUpdateDropdown grievance={row.original} />,
        });
    }
    
    return columns;
}
