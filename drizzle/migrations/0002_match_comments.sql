CREATE TABLE public.match_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  author_name text NOT NULL DEFAULT 'Fan',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT match_comments_body_len CHECK (char_length(body) BETWEEN 1 AND 500),
  CONSTRAINT match_comments_name_len CHECK (char_length(author_name) BETWEEN 1 AND 40)
);
CREATE INDEX match_comments_match_idx ON public.match_comments (match_id, created_at DESC);
GRANT SELECT ON public.match_comments TO anon;
GRANT SELECT, INSERT, DELETE ON public.match_comments TO authenticated;
GRANT ALL ON public.match_comments TO service_role;
ALTER TABLE public.match_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Match comments are public" ON public.match_comments FOR SELECT USING (true);
CREATE POLICY "Signed-in users post own comments" ON public.match_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.match_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);