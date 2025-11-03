import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: t('auth.signup_success', 'Account created successfully!'),
          description: t('auth.signup_success', 'Please check your email to verify your account.'),
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: t('auth.success', 'Welcome back!'),
          description: t('auth.success', 'You have successfully signed in.'),
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isSignUp ? t('auth.sign_up', 'Create Account') : t('auth.sign_in', 'Welcome Back')}
          </h1>
          <p className="text-muted-foreground">
            {t('auth.welcome', 'Welcome to Driving School Hub')}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="fullName">{t('auth.full_name', 'Full Name')}</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isSignUp ? t('auth.creating_account', 'Creating account...') : t('auth.signing_in', 'Signing in...')}
              </>
            ) : isSignUp ? (
              t('auth.sign_up', 'Sign Up')
            ) : (
              t('auth.sign_in', 'Sign In')
            )}
          </Button>
        </form>

        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            {t('auth.continue_as_guest', 'Continue as Guest')}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Limited features • Data expires in 7 days
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isSignUp
              ? t('auth.already_have_account', 'Already have an account?') + ' ' + t('auth.sign_in_here', 'Sign in here')
              : t('auth.no_account', "Don't have an account?") + ' ' + t('auth.sign_up_here', 'Sign up here')}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
