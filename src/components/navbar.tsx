
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookUser, Contact, Home, Info, LayoutList, Map, Menu, MessageSquare, ShieldCheck, Vote, Database, LogIn, LogOut, AlertTriangle, UserCog } from "lucide-react";
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import type { User } from "@/lib/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut as firebaseSignOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { ThemeToggle } from "./theme-toggle";


const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/contributors", label: "Contributions", icon: BookUser },
  { href: "/voting", label: "Voting", icon: Vote },
  { href: "/issue-map", label: "Issue Map", icon: Map },
  { href: "/data", label: "My Grievances", icon: Database, loginRequired: true },
  { href: "/feedback", label: "Report Grievance", icon: AlertTriangle, loginRequired: true },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Contact },
  { href: "/prioritize", label: "Prioritize", icon: LayoutList, adminRequired: true },
  { href: "/admin", label: "Admin", icon: UserCog, adminRequired: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userDocRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userData } = useDoc<User>(userDocRef);
  const isAdmin = userData?.role === 'admin';

  const handleSignOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
  }

  const getHref = (item: (typeof navItems)[0]) => {
    if (item.loginRequired && !user) {
      return `/login?redirect=${item.href}`;
    }
    return item.href;
  }

  const visibleNavItems = navItems.filter(item => {
    if (!isClient || isUserLoading) {
        // On the server or during initial client load, only show public items
        return !item.loginRequired && !item.adminRequired;
    }
    // On the client, after loading, determine visibility
    if (item.adminRequired) {
      return user && isAdmin;
    }
    if (item.loginRequired) {
        return !!user;
    }
    return true; // Public items
  });


  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? user?.email ?? ''}/>
              <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
            </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData?.name ?? user?.displayName ?? 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <ShieldCheck className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">Civix</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isVisible = 
                !item.adminRequired && !item.loginRequired ||
                (isClient && !isUserLoading && (
                    (item.adminRequired && user && isAdmin) ||
                    (item.loginRequired && user && !item.adminRequired)
                ));

            if (!isVisible && item.adminRequired) return null;

            return (
                 <Link
                    key={item.href}
                    href={getHref(item)}
                    className={cn(
                        "transition-colors hover:text-primary",
                        pathname === item.href ? "text-primary" : "text-muted-foreground",
                         // Hide auth-required links on server and during initial load
                        (item.loginRequired || item.adminRequired) && (!isClient || isUserLoading) ? 'hidden' : 'inline-block'
                    )}
                    prefetch={false}
                    >
                    {item.label}
                </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-4">
            <ThemeToggle />
          {isUserLoading || !isClient ? null : (
            user ? <UserMenu /> : (
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-6">
                <Link href="/" className="flex items-center gap-2 mb-4" onClick={() => setIsOpen(false)}>
                  <ShieldCheck className="h-7 w-7 text-primary" />
                  <span className="text-xl font-bold text-primary">Civix</span>
                </Link>
                {navItems.map((item) => {
                    const isVisible = 
                        !item.adminRequired && !item.loginRequired ||
                        (isClient && !isUserLoading && (
                            (item.adminRequired && user && isAdmin) ||
                            (item.loginRequired && user && !item.adminRequired)
                        ));
        
                    if (!isVisible) return null;
                    if (item.adminRequired && !(user && isAdmin)) return null;

                    return (
                        <Link
                            key={item.href}
                            href={getHref(item)}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-muted",
                            pathname === item.href ? "bg-muted text-primary" : "text-foreground"
                            )}
                            prefetch={false}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
