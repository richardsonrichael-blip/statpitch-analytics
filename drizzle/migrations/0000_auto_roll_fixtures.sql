CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.roll_past_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.matches
  SET commence_time = now() + make_interval(hours => 1 + floor(random() * 72)::int),
      status = 'TIMED',
      home_score = NULL,
      away_score = NULL
  WHERE commence_time < now() - interval '3 hours';

  UPDATE public.matches
  SET status = 'IN_PLAY',
      home_score = COALESCE(home_score, 0),
      away_score = COALESCE(away_score, 0)
  WHERE commence_time <= now() AND commence_time > now() - interval '2 hours' AND status <> 'IN_PLAY';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.roll_past_matches() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('roll-past-matches', '0 * * * *', $$SELECT public.roll_past_matches();$$);

SELECT public.roll_past_matches();