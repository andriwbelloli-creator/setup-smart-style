import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type Tier = "free" | "premium" | "pro";

export type SubscriptionState = {
  tier: Tier;
  status: string;
  loading: boolean;
  isPremium: boolean;
  isPro: boolean;
  canUse: (feature: PremiumFeature) => boolean;
};

export type PremiumFeature =
  | "unlimited_analysis"
  | "personalized_recommendations"
  | "unlimited_wishlist"
  | "compare_setups"
  | "pdf_report"
  | "no_ads"
  | "profile_highlight"
  | "consultation";

const FEATURE_MIN_TIER: Record<PremiumFeature, Tier> = {
  unlimited_analysis: "premium",
  personalized_recommendations: "premium",
  unlimited_wishlist: "premium",
  compare_setups: "premium",
  pdf_report: "premium",
  no_ads: "premium",
  profile_highlight: "pro",
  consultation: "pro",
};

const TIER_RANK: Record<Tier, number> = { free: 0, premium: 1, pro: 2 };

export function useSubscription(): SubscriptionState {
  const { user, loading: authLoading } = useAuth();
  const [tier, setTier] = useState<Tier>("free");
  const [status, setStatus] = useState<string>("active");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setTier("free");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("tier, status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setTier("free");
        setStatus("active");
      } else {
        const active = data.status === "active" || data.status === "trialing";
        setTier(active ? (data.tier as Tier) : "free");
        setStatus(data.status);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const isPremium = TIER_RANK[tier] >= TIER_RANK.premium;
  const isPro = tier === "pro";

  const canUse = (feature: PremiumFeature) => {
    const required = FEATURE_MIN_TIER[feature];
    return TIER_RANK[tier] >= TIER_RANK[required];
  };

  return { tier, status, loading, isPremium, isPro, canUse };
}
