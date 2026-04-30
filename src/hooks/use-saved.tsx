import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const KEY_LIKES = "deskly:likes";
const KEY_SAVES = "deskly:saves";

function readLocal(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch { return new Set(); }
}
function writeLocal(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify([...set]));
}

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function useTable(table: "likes" | "saves", localKey: string) {
  const { user } = useAuth();
  const [set, setSet] = useState<Set<string>>(() => readLocal(localKey));

  useEffect(() => {
    if (!user) { setSet(readLocal(localKey)); return; }
    (async () => {
      const { data } = await supabase.from(table).select("setup_id").eq("user_id", user.id);
      const remote = new Set<string>((data || []).map((r: any) => r.setup_id));
      // merge local mock-IDs that aren't UUIDs
      const local = readLocal(localKey);
      local.forEach((id) => { if (!isUuid(id)) remote.add(id); });
      setSet(remote);
    })();
  }, [user, table, localKey]);

  const toggle = useCallback(async (id: string) => {
    const has = set.has(id);
    const next = new Set(set);
    if (has) next.delete(id); else next.add(id);
    setSet(next);

    if (!user || !isUuid(id)) {
      writeLocal(localKey, next);
      return;
    }
    if (has) {
      const { error } = await supabase.from(table).delete().eq("user_id", user.id).eq("setup_id", id);
      if (error) { toast.error(error.message); setSet(set); }
    } else {
      const { error } = await supabase.from(table).insert({ user_id: user.id, setup_id: id });
      if (error) { toast.error(error.message); setSet(set); }
    }
  }, [set, user, table, localKey]);

  const has = useCallback((id: string) => set.has(id), [set]);
  return { set, has, toggle, count: set.size };
}

export const useLikes = () => useTable("likes", KEY_LIKES);
export const useSaves = () => useTable("saves", KEY_SAVES);
