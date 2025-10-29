import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isGuest, guestId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && !guestId) {
      navigate("/auth");
    }
  }, [user, loading, guestId, navigate]);

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
