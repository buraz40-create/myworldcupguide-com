# Daily World Cup Bot . setup

This workflow runs once a day. For each finished match it:

1. Pulls the final score from ESPN's public scoreboard API.
2. Searches YouTube for a highlight video and stores the best match.
3. Writes a daily recap blog post linking every match to its match page (where the embed renders).
4. Commits the JSON + blog updates back to the repo.
5. Rebuilds the static site and uploads via FTPS to HostGator.
6. Pings IndexNow so search engines pick up the new pages within minutes.

## One-time setup

Push this repo to GitHub (private is fine), then add these repository secrets at `Settings > Secrets and variables > Actions`:

| Secret | Where to get it |
| --- | --- |
| `YOUTUBE_API_KEY` | console.cloud.google.com . Create a project . Enable "YouTube Data API v3" . APIs & Services > Credentials > Create Credentials > API key. Free quota: 10,000 units/day (one match search costs ~101 units, fits ~99 matches/day). |
| `FTP_USER` | `myworldcupguide` |
| `FTP_PASS` | The HostGator FTP password from your `/tmp/.netrc` |
| `FTP_HOST` | `myworldcupguide.com` |
| `EXTRACT_TOKEN` | `214fdb3cdfe6e09846b7c9baee444ad9` (already hardcoded in `extract.php`) |

The `GITHUB_TOKEN` is provided by Actions automatically . used so the workflow can commit data updates back to the repo.

## Schedule

Cron: `0 9 * * *` (09:00 UTC every day).

That lands ~5am ET, after late North American matches finish and broadcasters have posted highlights, before US morning search traffic peaks.

To change, edit `.github/workflows/daily-bot.yml`. To run manually, go to the Actions tab and click "Run workflow" on Daily World Cup Bot.

## Local testing

```
# Test the scrape pipeline locally before pushing
YOUTUBE_API_KEY=your_key node scripts/fetch-match-scores.mjs
YOUTUBE_API_KEY=your_key node scripts/fetch-highlights.mjs
node scripts/generate-matchday-recap.mjs 2026-06-11
```
