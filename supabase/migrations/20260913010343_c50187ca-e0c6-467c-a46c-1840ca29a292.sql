CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sport text NOT NULL,
  league text NOT NULL,
  commence_time timestamp with time zone NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  status text NOT NULL DEFAULT 'TIMED',
  home_score integer,
  away_score integer,
  books jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.matches TO anon;
GRANT SELECT ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are publicly viewable" ON public.matches FOR SELECT USING (true);

CREATE TRIGGER matches_set_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX matches_sport_time_idx ON public.matches (sport, commence_time);

INSERT INTO public.matches (sport, league, commence_time, home_team, away_team, status, home_score, away_score, books) VALUES
('football','Premier League', now() + interval '4 hours','Arsenal','Manchester City','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":2.55,"drawDecimal":3.40,"awayDecimal":2.70},{"name":"1xBet","homeDecimal":2.62,"drawDecimal":3.35,"awayDecimal":2.66},{"name":"Betway","homeDecimal":2.50,"drawDecimal":3.45,"awayDecimal":2.75},{"name":"Ladbrokes","homeDecimal":2.58,"drawDecimal":3.30,"awayDecimal":2.68}]'::jsonb),
('football','Premier League', now() + interval '1 day','Liverpool','Chelsea','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.95,"drawDecimal":3.70,"awayDecimal":3.80},{"name":"1xBet","homeDecimal":2.00,"drawDecimal":3.60,"awayDecimal":3.90},{"name":"Betway","homeDecimal":1.92,"drawDecimal":3.75,"awayDecimal":3.85}]'::jsonb),
('football','Premier League', now() - interval '35 minutes','Tottenham','Newcastle','IN_PLAY',1,1,'[{"name":"Bet365","homeDecimal":2.30,"drawDecimal":3.25,"awayDecimal":3.10},{"name":"SportyBet","homeDecimal":2.35,"drawDecimal":3.20,"awayDecimal":3.05},{"name":"Stake","homeDecimal":2.28,"drawDecimal":3.30,"awayDecimal":3.15}]'::jsonb),
('football','UEFA Champions League', now() + interval '2 days','Real Madrid','Bayern Munich','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":2.20,"drawDecimal":3.50,"awayDecimal":3.10},{"name":"1xBet","homeDecimal":2.25,"drawDecimal":3.45,"awayDecimal":3.05},{"name":"Paddy Power","homeDecimal":2.15,"drawDecimal":3.55,"awayDecimal":3.20}]'::jsonb),
('football','UEFA Champions League', now() + interval '2 days 2 hours','Inter Milan','Paris Saint-Germain','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":2.90,"drawDecimal":3.30,"awayDecimal":2.40},{"name":"Betway","homeDecimal":2.95,"drawDecimal":3.25,"awayDecimal":2.38},{"name":"Stake","homeDecimal":2.85,"drawDecimal":3.35,"awayDecimal":2.44}]'::jsonb),
('football','La Liga', now() + interval '1 day 5 hours','Barcelona','Atletico Madrid','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.75,"drawDecimal":3.80,"awayDecimal":4.60},{"name":"1xBet","homeDecimal":1.78,"drawDecimal":3.75,"awayDecimal":4.50},{"name":"Ladbrokes","homeDecimal":1.72,"drawDecimal":3.90,"awayDecimal":4.70}]'::jsonb),
('football','Serie A', now() + interval '3 days','Juventus','Napoli','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":2.45,"drawDecimal":3.20,"awayDecimal":2.90},{"name":"Betway","homeDecimal":2.50,"drawDecimal":3.15,"awayDecimal":2.85}]'::jsonb),
('football','Bundesliga', now() + interval '3 days 4 hours','Borussia Dortmund','RB Leipzig','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":2.10,"drawDecimal":3.60,"awayDecimal":3.30},{"name":"1xBet","homeDecimal":2.14,"drawDecimal":3.55,"awayDecimal":3.25},{"name":"SportyBet","homeDecimal":2.08,"drawDecimal":3.65,"awayDecimal":3.35}]'::jsonb),
('basketball','NBA', now() + interval '6 hours','Boston Celtics','Milwaukee Bucks','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.65,"drawDecimal":null,"awayDecimal":2.30},{"name":"1xBet","homeDecimal":1.68,"drawDecimal":null,"awayDecimal":2.26},{"name":"Stake","homeDecimal":1.62,"drawDecimal":null,"awayDecimal":2.35}]'::jsonb),
('basketball','NBA', now() + interval '8 hours','Denver Nuggets','Phoenix Suns','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.50,"drawDecimal":null,"awayDecimal":2.65},{"name":"Betway","homeDecimal":1.52,"drawDecimal":null,"awayDecimal":2.60}]'::jsonb),
('basketball','NBA', now() - interval '50 minutes','Los Angeles Lakers','Golden State Warriors','IN_PLAY',58,62,'[{"name":"Bet365","homeDecimal":2.05,"drawDecimal":null,"awayDecimal":1.80},{"name":"1xBet","homeDecimal":2.10,"drawDecimal":null,"awayDecimal":1.77},{"name":"SportyBet","homeDecimal":2.00,"drawDecimal":null,"awayDecimal":1.84}]'::jsonb),
('basketball','EuroLeague', now() + interval '1 day 3 hours','Real Madrid Baloncesto','Olympiacos','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.70,"drawDecimal":null,"awayDecimal":2.20},{"name":"Betway","homeDecimal":1.73,"drawDecimal":null,"awayDecimal":2.16}]'::jsonb),
('basketball','EuroLeague', now() + interval '2 days 1 hour','Panathinaikos','Fenerbahce Beko','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.85,"drawDecimal":null,"awayDecimal":1.98},{"name":"Stake","homeDecimal":1.88,"drawDecimal":null,"awayDecimal":1.95}]'::jsonb),
('tennis','ATP Tour', now() + interval '5 hours','Carlos Alcaraz','Alexander Zverev','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.45,"drawDecimal":null,"awayDecimal":2.80},{"name":"1xBet","homeDecimal":1.47,"drawDecimal":null,"awayDecimal":2.75}]'::jsonb),
('tennis','ATP Tour', now() + interval '1 day 7 hours','Jannik Sinner','Daniil Medvedev','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.35,"drawDecimal":null,"awayDecimal":3.20},{"name":"Betway","homeDecimal":1.37,"drawDecimal":null,"awayDecimal":3.10},{"name":"Stake","homeDecimal":1.33,"drawDecimal":null,"awayDecimal":3.30}]'::jsonb),
('tennis','WTA Tour', now() + interval '9 hours','Iga Swiatek','Aryna Sabalenka','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.90,"drawDecimal":null,"awayDecimal":1.92},{"name":"1xBet","homeDecimal":1.93,"drawDecimal":null,"awayDecimal":1.89}]'::jsonb),
('tennis','WTA Tour', now() - interval '25 minutes','Coco Gauff','Elena Rybakina','IN_PLAY',1,0,'[{"name":"Bet365","homeDecimal":2.10,"drawDecimal":null,"awayDecimal":1.75},{"name":"SportyBet","homeDecimal":2.05,"drawDecimal":null,"awayDecimal":1.80}]'::jsonb),
('american-football','NFL', now() + interval '1 day 10 hours','Kansas City Chiefs','Buffalo Bills','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.80,"drawDecimal":null,"awayDecimal":2.05},{"name":"1xBet","homeDecimal":1.83,"drawDecimal":null,"awayDecimal":2.02}]'::jsonb),
('ice-hockey','NHL', now() + interval '7 hours','Toronto Maple Leafs','Boston Bruins','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":2.20,"drawDecimal":4.10,"awayDecimal":2.45},{"name":"Betway","homeDecimal":2.25,"drawDecimal":4.00,"awayDecimal":2.40}]'::jsonb),
('cricket','ICC ODI', now() + interval '2 days 6 hours','India','Australia','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.75,"drawDecimal":null,"awayDecimal":2.10},{"name":"1xBet","homeDecimal":1.78,"drawDecimal":null,"awayDecimal":2.06}]'::jsonb),
('combat','UFC', now() + interval '4 days','Islam Makhachev','Arman Tsarukyan','TIMED',NULL,NULL,'[{"name":"Bet365","homeDecimal":1.55,"drawDecimal":null,"awayDecimal":2.50},{"name":"Stake","homeDecimal":1.58,"drawDecimal":null,"awayDecimal":2.45}]'::jsonb);