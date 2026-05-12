-- Permite que admins deletem qualquer setup (moderação).
-- Owners já podem deletar os próprios via policy "setups delete own".
-- Esta policy é adicional, com base no role admin via has_role().

DROP POLICY IF EXISTS "setups delete admin" ON public.setups;
CREATE POLICY "setups delete admin"
  ON public.setups FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Idem para setup_products (cleanup quando deletar setup já é
-- cascade via FK, mas deixamos explícito caso admin queira deletar
-- só um produto).
DROP POLICY IF EXISTS "setup_products delete admin" ON public.setup_products;
CREATE POLICY "setup_products delete admin"
  ON public.setup_products FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- E para setup_images.
DROP POLICY IF EXISTS "setup_images delete admin" ON public.setup_images;
CREATE POLICY "setup_images delete admin"
  ON public.setup_images FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
