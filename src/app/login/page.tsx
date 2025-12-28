
import { Suspense } from "react";
import { LoginFormWrapper } from "@/components/login-form-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";


const LoginPageLoading = () => {
    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                    <Skeleton className="h-8 w-48 mx-auto mt-2" />
                    <Skeleton className="h-4 w-64 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
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
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginFormWrapper />
    </Suspense>
  );
}
