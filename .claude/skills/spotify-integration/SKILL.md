---
name: spotify-integration
description: Detailed specification for the Spotify "Music Taste" integration using Supabase Edge Functions and caching.
---

# Spotify Integration Expert

## System Overview

Displays personal Spotify data (Top Tracks, Recent) on the public site without hitting Spotify's API directly on every load. Uses **Supabase** for caching and **Edge Functions** for data fetching.

## Architecture

1.  **Source**: Spotify Web API.
2.  **Middleware**: Supabase Edge Function (Deno/TS).
3.  **Storage**: `music_cache` table in Supabase (Singleton row).
4.  **Trigger**: `pg_cron` runs daily.
5.  **Client**: Fetches from Supabase DB.

## Database Schema (`music_cache`)

-   `id`: text ('current_state')
-   `top_tracks`: jsonb
-   `recent_tracks`: jsonb
-   `last_updated`: timestamptz

## Authentication (Silent Auth)

-   Use manual OAuth to get **Refresh Token**.
-   Store Refresh Token in Supabase Secrets.
-   Edge Function uses Refresh Token to get Access Token.

## UI Data

-   **Top Tracks**: Curated all-time favorites.
-   **Recent Tracks**: Recently played.
-   **Visuals**: Album art, Song Title, Artist.
-   **Interaction**: Bento grid, hover effects. NO audio playback.

## API Endpoints

-   `GET /v1/me/top/tracks?time_range=long_term&limit=10`
-   `GET /v1/me/player/recently-played?limit=10`


