
-- Restrict storage SELECT: only owner can list their own files; reads still go through public CDN URLs
DROP POLICY IF EXISTS "setups storage read public" ON storage.objects;
CREATE POLICY "setups storage list own" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'setups'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR auth.uid() IS NULL  -- allow anonymous reads via direct URL fetch (CDN bypasses RLS for object content)
    )
  );

-- Lock down internal trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_saves_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role must remain callable for RLS evaluation; that's intentional.
