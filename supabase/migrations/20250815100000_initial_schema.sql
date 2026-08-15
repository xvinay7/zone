-- Initial schema for Remind task-bundling app
-- Tables: tasks, suggestions_log, notification_budget

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.task_category AS ENUM (
  'grocery',
  'pharmacy',
  'errand',
  'other'
);

CREATE TYPE public.task_status AS ENUM (
  'pending',
  'done'
);

CREATE TYPE public.suggestion_action AS ENUM (
  'dismissed',
  'acted',
  'expired'
);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  category public.task_category NOT NULL DEFAULT 'other',
  place_name text NOT NULL DEFAULT 'Unassigned',
  lat double precision,
  lng double precision,
  status public.task_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasks_user_id_idx ON public.tasks (user_id);
CREATE INDEX tasks_status_idx ON public.tasks (status);
CREATE INDEX tasks_user_id_status_idx ON public.tasks (user_id, status);
CREATE INDEX tasks_user_id_created_at_idx ON public.tasks (user_id, created_at DESC);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_own"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_own"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_delete_own"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- suggestions_log
-- ---------------------------------------------------------------------------

CREATE TABLE public.suggestions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  task_ids uuid[] NOT NULL DEFAULT '{}',
  score numeric(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  why_now_text text NOT NULL,
  shown_at timestamptz NOT NULL DEFAULT now(),
  action public.suggestion_action
);

CREATE INDEX suggestions_log_user_id_idx ON public.suggestions_log (user_id);
CREATE INDEX suggestions_log_user_id_shown_at_idx ON public.suggestions_log (user_id, shown_at DESC);
CREATE INDEX suggestions_log_action_idx ON public.suggestions_log (action);

ALTER TABLE public.suggestions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suggestions_log_select_own"
  ON public.suggestions_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "suggestions_log_insert_own"
  ON public.suggestions_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "suggestions_log_update_own"
  ON public.suggestions_log
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "suggestions_log_delete_own"
  ON public.suggestions_log
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- notification_budget
-- ---------------------------------------------------------------------------

CREATE TABLE public.notification_budget (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  suggestions_today integer NOT NULL DEFAULT 0 CHECK (suggestions_today >= 0),
  last_suggestion_at timestamptz,
  muted_places text[] NOT NULL DEFAULT '{}'
);

ALTER TABLE public.notification_budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_budget_select_own"
  ON public.notification_budget
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notification_budget_insert_own"
  ON public.notification_budget
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_budget_update_own"
  ON public.notification_budget
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_budget_delete_own"
  ON public.notification_budget
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
