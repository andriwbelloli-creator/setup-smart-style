import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const PAGE_SIZE = 10;

export type CommentAuthor = {
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export type Comment = {
  id: string;
  setup_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: CommentAuthor | null;
};

const bodySchema = z
  .string()
  .trim()
  .min(1, "Comentário vazio")
  .max(500, "Máximo 500 caracteres");

// comments.author_id referencia auth.users(id), não public.profiles(id).
// Por isso o embed via PostgREST (profiles!comments_author_id_fkey) dá 400.
// Solução: lookup separado em profiles (profiles.id = auth.users.id).
async function hydrateAuthors(rows: Comment[]): Promise<Comment[]> {
  if (rows.length === 0) return rows;
  const ids = Array.from(new Set(rows.map((r) => r.author_id).filter(Boolean)));
  if (ids.length === 0) return rows;
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", ids);
  const byId = new Map<string, CommentAuthor>(
    ((profs as any[]) || []).map((p) => [
      p.id as string,
      { username: p.username, display_name: p.display_name, avatar_url: p.avatar_url },
    ]),
  );
  return rows.map((r) => ({ ...r, author: byId.get(r.author_id) ?? null }));
}

export function useComments(setupId: string, enabled: boolean) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [live, setLive] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());

  const fetchPage = useCallback(
    async (pageIndex: number) => {
      setLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from("comments")
        .select("*", { count: "exact" })
        .eq("setup_id", setupId)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) {
        setLoading(false);
        return { error };
      }
      const baseRows = (data as any as Comment[]) || [];
      const rows = await hydrateAuthors(baseRows);
      setLoading(false);
      rows.forEach((r) => seenIds.current.add(r.id));
      setTotal(count ?? 0);
      setComments((prev) => (pageIndex === 0 ? rows : [...prev, ...rows]));
      return { ok: true };
    },
    [setupId],
  );

  // initial load
  useEffect(() => {
    if (!enabled || !setupId) return;
    seenIds.current = new Set();
    setPage(0);
    fetchPage(0);
  }, [enabled, setupId, fetchPage]);

  // realtime subscription
  useEffect(() => {
    if (!enabled || !setupId) return;
    const channel = supabase
      .channel(`comments:${setupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `setup_id=eq.${setupId}`,
        },
        async (payload) => {
          const row = payload.new as Comment;
          if (seenIds.current.has(row.id)) return;
          seenIds.current.add(row.id);
          const { data: author } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", row.author_id)
            .maybeSingle();
          setComments((prev) => [{ ...row, author: author as any }, ...prev]);
          setTotal((t) => t + 1);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `setup_id=eq.${setupId}`,
        },
        (payload) => {
          const oldId = (payload.old as any)?.id;
          if (!oldId) return;
          seenIds.current.delete(oldId);
          setComments((prev) => prev.filter((c) => c.id !== oldId));
          setTotal((t) => Math.max(t - 1, 0));
        },
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setLive(false);
    };
  }, [enabled, setupId]);

  const loadMore = useCallback(async () => {
    const next = page + 1;
    setPage(next);
    await fetchPage(next);
  }, [page, fetchPage]);

  const post = useCallback(
    async (rawBody: string, authorId: string) => {
      const parsed = bodySchema.safeParse(rawBody);
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Inválido" };
      }
      setPosting(true);
      const { data, error } = await supabase
        .from("comments")
        .insert({ setup_id: setupId, author_id: authorId, body: parsed.data })
        .select("*")
        .single();
      if (error) {
        setPosting(false);
        return { error: error.message };
      }
      const [withAuthor] = await hydrateAuthors([data as any as Comment]);
      setPosting(false);
      if (!seenIds.current.has(withAuthor.id)) {
        seenIds.current.add(withAuthor.id);
        setComments((prev) => [withAuthor, ...prev]);
        setTotal((t) => t + 1);
      }
      return { ok: true };
    },
    [setupId],
  );

  const remove = useCallback(async (id: string) => {
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== id));
    setTotal((t) => Math.max(t - 1, 0));
    seenIds.current.delete(id);
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      setComments(prev);
      setTotal((t) => t + 1);
      return { error: error.message };
    }
    return { ok: true };
  }, [comments]);

  const hasMore = comments.length < total;

  return { comments, total, loading, posting, live, hasMore, loadMore, post, remove };
}
