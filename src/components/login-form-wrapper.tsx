
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  signInWithRedirect,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail,
  type User as FirebaseAuthUser,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { User } from "@/lib/types";


const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine(data => {
    // In a real app, you might have a separate form or state for signup
    // to make this cleaner. For now, we'll assume if name is present, it's a signup.
    // This logic is coupled with the form's onSubmit.
    return true;
});

export function LoginFormWrapper() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const createUserProfile = async (firebaseUser: FirebaseAuthUser, name?: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", firebaseUser.uid);

    const userDoc = await getDoc(userRef);
    // Only create a new profile if one doesn't exist
    if (!userDoc.exists()) {
        const newUserData: User = {
            id: firebaseUser.uid,
            name: name || firebaseUser.displayName || firebaseUser.email!,
            email: firebaseUser.email!,
            role: "citizen", // All new users are citizens by default
        };

        setDoc(userRef, newUserData).catch(error => {
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: newUserData
            });
            errorEmitter.emit('permission-error', permissionError);
            console.error("Failed to create user profile:", error);
            toast({
                variant: "destructive",
                title: "Profile Creation Failed",
                description: "There was an error setting up your user profile."
            });
        });
    }
  }

  // Effect to handle redirect result from Google Sign-In
  useEffect(() => {
    if (!auth) return;
    const handleRedirect = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                await createUserProfile(result.user);
            }
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Sign in failed",
                description: error.message || "An unexpected error occurred during Google sign-in."
            })
        }
    };
    handleRedirect();
  }, [auth, toast]);


  useEffect(() => {
    if (!isUserLoading && user) {
        if (redirect) {
            router.push(redirect);
        } else {
            router.push("/");
        }
    }
  }, [user, isUserLoading, router, redirect]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    // Use signInWithRedirect instead of popup
    await signInWithRedirect(auth, provider);
  };

  const handlePasswordReset = async () => {
    if (!auth) return;
    const email = form.getValues("email");
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists for this email, you will receive a link to reset your password shortly.",
      });
    } catch (error: any) {
      // Log the actual error for debugging, but show a generic message to the user.
      console.error("Password reset error:", error);
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists for this email, you will receive a link to reset your password shortly. Check your spam folder.",
      });
    }
  };


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!auth) return;

    if (isSignUp && (!values.name || values.name.length < 2)) {
        form.setError("name", { type: "manual", message: "Name must be at least 2 characters." });
        return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        // Update Firebase Auth profile
        await updateProfile(userCredential.user, { displayName: values.name });
        // Create Firestore profile
        await createUserProfile(userCredential.user, values.name);
        toast({
            title: "Account Created",
            description: "You have been successfully signed up!"
        });
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      }
    } catch (error: any) {
      let title = isSignUp ? "Sign up failed" : "Sign in failed";
      let description = "An unexpected error occurred. Please try again.";

      switch (error.code) {
        case 'auth/email-already-in-use':
          if (isSignUp) {
            setIsSignUp(false); // Switch to sign-in mode
            title = "Account Exists";
            description = "An account with this email already exists. Please sign in instead.";
          }
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          description = "Invalid email or password. Please check your credentials and try again.";
          break;
        default:
          description = error.message || description;
          break;
      }
      
      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
    }
  };


  if (isUserLoading || user) {
    return (
        <div className="flex items-center justify-center min-h-screen animate-fade-in">
            <p>Loading...</p>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12 animate-fade-in">
      <Card className="w-full max-w-md mx-auto animate-slide-in-up">
        <CardHeader className="text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">{isSignUp ? "Create an Account" : "Login to Civix"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Enter your details to create an account." : "Sign in to report issues and participate in your community."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isSignUp && (
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                        <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      {!isSignUp && (
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-xs"
                          onClick={handlePasswordReset}
                        >
                          Forgot Password?
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button onClick={handleGoogleSignIn} className="w-full" variant="outline">
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
