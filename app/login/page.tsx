"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Brand Section */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
            WorkoutOS
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your personalized workout dashboard
          </p>
        </div>

        {/* Sign In Button */}
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          size="lg"
          className="w-full h-11 font-medium"
        >
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </Button>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          By signing in, you agree to our terms of service
        </p>
      </Card>
    </div>
  );
}
