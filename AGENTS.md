<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
 
Analytics presentation remains separate from stored bookmaker inputs so promotions can be hidden without changing fixture calculations or payment logic.
Use the shared sports directory for navigation and server validation so every supported sport is selectable and loadable.
Read explicit match probability distributions before legacy price-derived probabilities so analytics-only fixtures do not require bookmaker data.
- Football fixtures come from API-Football server-side (15-min cache, 100 req/day plan) and fall back to the matches table; the key stays server-only so it is never shipped to browsers.
Use shared TeamCrest and hasMatchProbabilities fallbacks for match displays so unavailable badges and analytics collapse consistently.
Live score freshness uses the successful fixture retrieval timestamp, never the browser query time or kickoff, so cached and fallback data cannot appear newly updated.
- Match details drawer loads per-fixture API-Football detail (fixture, odds, H2H, standings) on open with a 15-min cache, so list views never spend detail requests.
- Match explanations use an authenticated streaming server route with server-resolved public football context only; model credentials and persistent provider-denial state stay server-only to prevent forged inputs and replayed denied calls.
