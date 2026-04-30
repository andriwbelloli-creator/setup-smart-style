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

const AUTHOR_SELECT =
  "*, author:profiles!comments_author_id_fkey(username, display_name, avatar_url)";

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
        .select(AUTHOR_SELECT, { count: "exact" })
        .eq("setup_id", setupId)
        .order("created_at", { ascending: false })
        .range(from, to);
      setLoading(false);
      if (error) return { error };
      const rows = (data as any as Comment[]) || [];
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
          // fetch author
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
        .select(AUTHOR_SELECT)
        .single();
      setPosting(false);
      if (error) return { error: error.message };
      const row = data as any as Comment;
      if (!seenIds.current.has(row.id)) {
        seenIds.current.add(row.id);
        setComments((prev) => [row, ...prev]);
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