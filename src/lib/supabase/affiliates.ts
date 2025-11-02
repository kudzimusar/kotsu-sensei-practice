import { supabase } from "@/integrations/supabase/client";

export interface AffiliateProduct {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  commission_rate: number;
  affiliate_url: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserReferral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string | null;
  referral_code: string;
  status: string;
  commission_earned: number;
  created_at: string;
  completed_at: string | null;
  expires_at: string | null;
}

export interface UserEarning {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  description: string | null;
  reference_id: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
}

export const getAffiliateProducts = async () => {
  const { data, error } = await supabase
    .from("affiliate_products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching affiliate products:", error);
    throw error;
  }

  return data as AffiliateProduct[];
};

export const generateReferralCode = async () => {
  const { data, error } = await supabase.functions.invoke("generate-referral-code", {
    method: "POST"
  });

  if (error) {
    console.error("Error generating referral code:", error);
    throw error;
  }

  return data;
};

export const getUserReferrals = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_referrals")
    .select("*")
    .eq("referrer_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching referrals:", error);
    throw error;
  }

  return data as UserReferral[];
};

export const getUserEarnings = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_earnings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching earnings:", error);
    throw error;
  }

  return data as UserEarning[];
};

export const getTotalEarnings = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_earnings")
    .select("amount, status")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching total earnings:", error);
    throw error;
  }

  const pending = data
    .filter(e => e.status === "pending")
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  const approved = data
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  const paid = data
    .filter(e => e.status === "paid")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    pending,
    approved,
    paid,
    total: pending + approved + paid
  };
};

export const trackAffiliateClick = async (productId: string, referralCode?: string) => {
  const { data, error } = await supabase.functions.invoke("track-affiliate-click", {
    body: { productId, referralCode }
  });

  if (error) {
    console.error("Error tracking affiliate click:", error);
    throw error;
  }

  return data;
};
