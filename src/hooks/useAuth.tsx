import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useGuestSession } from "./useGuestSession";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { guestId, loading: guestLoading, clearGuestSession } = useGuestSession();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear guest session when user logs in
        if (session?.user && guestId) {
          clearGuestSession();
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [guestId, clearGuestSession]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const isGuest = !user && !!guestId;
  const isLoading = loading || guestLoading;

  return { 
    user, 
    session, 
    loading: isLoading, 
    signOut,
    isGuest,
    guestId,
  };
};
