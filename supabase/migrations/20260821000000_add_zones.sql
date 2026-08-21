-- Migration to add 'zones' for Familiar Zones architecture

-- ---------------------------------------------------------------------------
-- zones
-- ---------------------------------------------------------------------------

CREATE TABLE public.zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  radius_m integer NOT NULL DEFAULT 500 CHECK (radius_m > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX zones_user_id_idx ON public.zones (user_id);

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "zones_select_own"
  ON public.zones
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "zones_insert_own"
  ON public.zones
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "zones_update_own"
  ON public.zones
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "zones_delete_own"
  ON public.zones
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- tasks modification
-- ---------------------------------------------------------------------------

ALTER TABLE public.tasks 
  ADD COLUMN zone_id uuid REFERENCES public.zones (id) ON DELETE SET NULL;

CREATE INDEX tasks_zone_id_idx ON public.tasks (zone_id);
