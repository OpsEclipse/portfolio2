---
name: supabase-edge-expert
description: Expert in Deno-based Supabase Edge Functions, database schema design, and pg_cron scheduling.
---
# Supabase Edge Expert
## Implementation Rules
1. **Deno Best Practices:** Always use standard `serve` from `https://deno.land/std/http/server.ts`.
2. **Singleton Cache:** When updating `music_cache`, use an `upsert` targeting the `id: 'current_state'` to maintain a single row.
3. **Cron Syntax:** When generating `pg_cron` SQL, use: `SELECT cron.schedule('daily-spotify-sync', '0 0 * * *', 'select net.http_post(...)')`.
4. **Error Handling:** Always wrap the Spotify fetch in a `try/catch` and return a structured JSON error to the Supabase logs.