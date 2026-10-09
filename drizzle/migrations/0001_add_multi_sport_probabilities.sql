ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS probabilities jsonb;
COMMENT ON COLUMN public.matches.probabilities IS 'Analytics probabilities as homeWin, draw and awayWin percentages; sample fixtures use illustrative estimates, independent of bookmaker inputs.';
INSERT INTO public.matches (sport, league, commence_time, home_team, away_team, books, probabilities) VALUES
('baseball','MLB · Sample', now() + interval '8 hours','New York Yankees','Los Angeles Dodgers','[]','{"homeWin":48,"draw":0,"awayWin":52}'),
('baseball','MLB · Sample', now() + interval '22 hours','Atlanta Braves','Philadelphia Phillies','[]','{"homeWin":55,"draw":0,"awayWin":45}'),
('handball','EHF Champions League · Sample', now() + interval '10 hours','Barcelona','SC Magdeburg','[]','{"homeWin":57,"draw":8,"awayWin":35}'),
('handball','EHF Champions League · Sample', now() + interval '26 hours','Paris Saint-Germain','Aalborg Handbold','[]','{"homeWin":51,"draw":9,"awayWin":40}'),
('water-polo','Champions League · Sample', now() + interval '12 hours','Pro Recco','Olympiacos','[]','{"homeWin":60,"draw":7,"awayWin":33}'),
('water-polo','Champions League · Sample', now() + interval '28 hours','Ferencvaros','Novi Beograd','[]','{"homeWin":54,"draw":8,"awayWin":38}'),
('snooker','World Snooker Tour · Sample', now() + interval '14 hours','Judd Trump','Mark Selby','[]','{"homeWin":58,"draw":0,"awayWin":42}'),
('snooker','World Snooker Tour · Sample', now() + interval '30 hours','Ronnie O’Sullivan','Mark Allen','[]','{"homeWin":56,"draw":0,"awayWin":44}'),
('badminton','BWF World Tour · Sample', now() + interval '16 hours','Viktor Axelsen','Kunlavut Vitidsarn','[]','{"homeWin":61,"draw":0,"awayWin":39}'),
('badminton','BWF World Tour · Sample', now() + interval '32 hours','An Se-young','Chen Yufei','[]','{"homeWin":63,"draw":0,"awayWin":37}'),
('esports','Counter-Strike 2 · Sample', now() + interval '18 hours','Team Vitality','Natus Vincere','[]','{"homeWin":57,"draw":0,"awayWin":43}'),
('esports','League of Legends · Sample', now() + interval '34 hours','T1','Gen.G','[]','{"homeWin":46,"draw":0,"awayWin":54}');