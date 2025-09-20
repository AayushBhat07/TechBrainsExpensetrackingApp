import { Button } from "@/components/ui/button";
import { SignInPage } from "@/components/ui/sign-in";
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
      <div className="w-full max-w-5xl">
        <SignInPage
          title={<span className="font-light text-foreground tracking-tighter">Welcome to MoneyTalks</span>}
          description="Sign in to continue. You can also continue as guest."
          heroImageSrc="https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1600&auto=format&fit=crop"
          testimonials={[
            {
              avatarSrc: "https://i.pravatar.cc/100?img=12",
              name: "Alex Morgan",
              handle: "@alexm",
              text: "MoneyTalks keeps our roommate expenses crystal clear.",
            },
            {
              avatarSrc: "https://i.pravatar.cc/100?img=28",
              name: "Priya Singh",
              handle: "@priyas",
              text: "The insights helped me fix my monthly overspending.",
            },
            {
              avatarSrc: "https://i.pravatar.cc/100?img=45",
              name: "Diego Rivera",
              handle: "@diegor",
              text: "Groups and budgets are super intuitive here.",
            },
          ]}
          onSignIn={(e) => {
            e.preventDefault();
            toast("Email/password sign-in coming soon.");
          }}
          onGoogleSignIn={() => {
            toast("Google sign-in coming soon.");
          }}
          onResetPassword={() => {
            toast("Password reset coming soon.");
          }}
          onCreateAccount={() => {
            toast("Account creation coming soon.");
          }}
        />
        <div className="mt-6 flex items-center justify-center">
          <Button onClick={handleContinueAsGuest} disabled={isLoading} className="w-full max-w-md">
            {isLoading ? "Continuing..." : "Continue as Guest"}
          </Button>
        </div>
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