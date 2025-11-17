import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isGuest, guestId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if:
    // 1. Auth has finished loading (loading === false)
    // 2. User is definitely not logged in (user === null)
    // 3. No guest session exists (guestId === null/undefined)
    // This prevents race conditions where loading finishes before user is set
    if (loading) {
      return; // Wait for auth to finish loading
    }
    
    if (!user && !guestId) {
      // Preserve the intended destination so user can return after login
      navigate("/auth", { 
        state: { from: location.pathname + location.search },
        replace: true // Use replace to prevent back button issues
      });
    }
  }, [user, loading, guestId, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Allow access if user is logged in OR has a guest session
  if (!user && !guestId) {
    return null;
  }

  return <>{children}</>;
};
