ALTER TABLE public.match_comments ADD COLUMN display_name text NOT NULL DEFAULT 'Fan';
UPDATE public.match_comments AS c SET display_name = CASE WHEN p.full_name IS NOT NULL AND btrim(p.full_name) <> '' AND p.full_name NOT LIKE '%@%' AND c.author_name = left(p.full_name, 40) THEN left(btrim(p.full_name), 40) ELSE 'Fan' END FROM public.profiles AS p WHERE c.user_id = p.id;
REVOKE SELECT ON public.match_comments FROM PUBLIC, anon, authenticated;
REVOKE SELECT (user_id, author_name) ON public.match_comments FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, match_id, display_name, body, created_at) ON public.match_comments TO anon, authenticated;
GRANT INSERT, DELETE ON public.match_comments TO authenticated;
GRANT ALL ON public.match_comments TO service_role;
COMMENT ON COLUMN public.match_comments.author_name IS 'DEPRECATED: public chat uses display_name; legacy names may contain email-derived identifiers and must not be exposed.';
DO $$ BEGIN
IF has_column_privilege('anon', 'public.match_comments', 'user_id', 'SELECT') OR has_column_privilege('authenticated', 'public.match_comments', 'user_id', 'SELECT') OR has_column_privilege('anon', 'public.match_comments', 'author_name', 'SELECT') OR has_column_privilege('authenticated', 'public.match_comments', 'author_name', 'SELECT') THEN RAISE EXCEPTION 'Private chat identifiers remain readable'; END IF;
IF NOT has_column_privilege('anon', 'public.match_comments', 'display_name', 'SELECT') OR NOT has_column_privilege('authenticated', 'public.match_comments', 'body', 'SELECT') THEN RAISE EXCEPTION 'Public chat fields are not readable'; END IF;
END $$;