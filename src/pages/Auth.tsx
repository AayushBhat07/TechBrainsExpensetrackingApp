import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { useAuth } from "@/hooks/use-auth";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { toast } from "sonner";

interface AuthProps {
  redirectAfterAuth?: string;
}

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "SplitWise made managing shared expenses with my roommates so much easier. No more awkward conversations!"
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "Finally, an app that actually simplifies expense splitting. Clean design and works perfectly for our group trips."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "Love how transparent everything is. Everyone can see exactly what they owe and what's been paid. Game changer!"
  },
];

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const onboardingProfile = useQuery(api.onboarding.getProfile);

  useEffect(() => {
    if (!authLoading && isAuthenticated && onboardingProfile !== undefined) {
      // Decide where to go based on onboarding status
      const base = "/dashboard";
      const target =
        !onboardingProfile || !onboardingProfile.onboardingCompleted
          ? `${base}?onboarding=1`
          : base;
      navigate(target);
    }
  }, [authLoading, isAuthenticated, onboardingProfile, navigate]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      
      if (!email) {
        toast.error("Please enter your email address");
        setIsLoading(false);
        return;
      }

      // For now, we'll use the email OTP flow
      await signIn("email-otp", formData);
      toast.success("Verification code sent to your email!");
      
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // For now, we'll use anonymous sign-in as a placeholder
      await signIn("anonymous");
      toast.success("Signed in successfully!");
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    toast.info("Password reset functionality coming soon!");
  };

  const handleCreateAccount = () => {
    toast.info("Just enter your email above to create an account or sign in!");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SignInPage
      title={
        <span className="font-light text-foreground tracking-tighter">
          Welcome to <span className="font-semibold">SplitWise</span>
        </span>
      }
      description="Split expenses effortlessly with friends, family, and roommates"
      heroImageSrc="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=2160&q=80"
      testimonials={sampleTestimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}