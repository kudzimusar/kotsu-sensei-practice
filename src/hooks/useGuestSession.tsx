import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const GUEST_SESSION_KEY = "guest_session_id";
const GUEST_SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface GuestSession {
  id: string;
  expiresAt: number;
}

export const useGuestSession = () => {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initGuestSession = async () => {
      try {
        // Check for existing guest session in localStorage
        const stored = localStorage.getItem(GUEST_SESSION_KEY);
        
        if (stored) {
          const session: GuestSession = JSON.parse(stored);
          
          // Check if session is expired
          if (Date.now() < session.expiresAt) {
            // Verify session still exists in database
            const { data } = await supabase
              .from("guest_sessions")
              .select("id")
              .eq("id", session.id)
              .gt("expires_at", new Date().toISOString())
              .maybeSingle();
            
            if (data) {
              setGuestId(session.id);
              setLoading(false);
              return;
            }
          }
          
          // Session expired or invalid, remove it
          localStorage.removeItem(GUEST_SESSION_KEY);
        }
        
        // Create new guest session
        const { data, error } = await supabase
          .from("guest_sessions")
          .insert({})
          .select()
          .single();
        
        if (error) throw error;
        
        if (data) {
          const newSession: GuestSession = {
            id: data.id,
            expiresAt: Date.now() + GUEST_SESSION_EXPIRY,
          };
          
          localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newSession));
          setGuestId(data.id);
        }
      } catch (error) {
        console.error("Error initializing guest session:", error);
      } finally {
        setLoading(false);
      }
    };

    initGuestSession();
  }, []);

  const clearGuestSession = () => {
    localStorage.removeItem(GUEST_SESSION_KEY);
    setGuestId(null);
  };

  return { guestId, loading, clearGuestSession };
};
