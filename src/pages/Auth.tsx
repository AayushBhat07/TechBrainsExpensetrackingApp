import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { toast } from "sonner";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const onboardingProfile = useQuery(api.onboarding.getProfile);

  useEffect(() => {
    if (!authLoading && isAuthenticated && onboardingProfile !== undefined) {
      const base = "/dashboard";
      const target =
        !onboardingProfile || !onboardingProfile.onboardingCompleted
          ? `${base}?onboarding=1`
          : base;
      navigate(target);
    }
  }, [authLoading, isAuthenticated, onboardingProfile, navigate]);

  const handleContinueAsGuest = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
      toast.success("Continuing as guest...");
      // Redirect handled by useEffect above after auth state + profile load
    } catch (error) {
      console.error("Anonymous sign-in error:", error);
      toast.error("Failed to continue as guest. Please try again.");
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Continue as a guest to explore the app. You can complete onboarding on the dashboard.
        </p>
        <Button
          onClick={handleContinueAsGuest}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Continuing..." : "Continue as Guest"}
        </Button>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}