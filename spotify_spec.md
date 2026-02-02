# Planning: Spotify "Music Taste" Integration

## 1. System Overview
A performance-optimized integration that displays personal Spotify data on a public website. To ensure high speed and bypass Spotify’s API rate limits, the site will fetch data from a **Supabase cache** rather than calling Spotify directly on every page load.

---

## 2. Technical Architecture
### Data Flow
1. **Source:** Spotify Web API (Top Tracks & Recently Played).
2. **Middleware:** Supabase Edge Function (Deno/TypeScript) handles authentication and data normalization.
3. **Storage:** Supabase Postgres table acting as a JSON cache.
4. **Trigger:** Automated via `pg_cron` to run once every 24 hours.
5. **Client:** Public website (Webflow/Next.js/HTML) fetches the single cache row via the Supabase Client.

### Authentication (Silent Auth)
* A one-time manual OAuth flow is used to obtain a **Refresh Token**.
* This token is stored as a Supabase Secret.
* The Edge Function uses this token to request a fresh **Access Token** daily without human intervention.

---

## 3. Database Specification
**Table Name:** `music_cache`

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `'current_state'` | Primary key (singleton row). |
| `top_tracks` | `jsonb` | `[]` | Curated list of all-time favorite tracks. |
| `recent_tracks`| `jsonb` | `[]` | List of recently played tracks. |
| `last_updated` | `timestamptz` | `now()` | Timestamp for the "Last Updated" UI label. |

---

## 4. UI/UX Specification
### Entry Point & Tab
* **Trigger:** A minimalist vertical tab/pill on the right or bottom edge of the viewport.
* **Label:** "Music Taste" or a simple "♫" icon.
* **Interaction:** Clicking the tab slides out a side-drawer or opens a modal.

### The Music Grid
* **Layout:** A clean, 2-column "Bento" style grid.
* **Visuals:** High-quality album artwork in square containers.
* **Hover Interaction:** * **Visual:** Subtle scale-up (e.g., `scale(1.05)`) and a background blur overlay.
    * **Details:** Display **Song Title** and **Artist Name** in a high-contrast sans-serif font.
* **Metadata:** Small footer text at the bottom of the drawer: *"Last updated: [Relative Date]"*.

### Design Constraints
* **No Playback:** Songs are visual references only; no audio players or preview clips.
* **No Filtering:** The data is a static daily snapshot; users cannot sort or search.
* **Consistency:** Use a neutral palette (dark mode preferred for music) to stay consistent with the existing site design.

---

## 5. API Configuration
### Spotify Endpoints
* **Top Tracks:** `GET /v1/me/top/tracks?time_range=long_term&limit=10`
* **Recent Tracks:** `GET /v1/me/player/recently-played?limit=10`
* **Required Scopes:** `user-top-read`, `user-read-recently-played`.

---

## 6. Development Checklist
- [ ] Create Spotify Developer App and save Client ID/Secret.
- [ ] Run a local script to capture the one-time `refresh_token`.
- [ ] Initialize Supabase table with RLS (Select: Public, Update: Service Role Only).
- [ ] Write and deploy Edge Function to fetch, clean, and upsert data.
- [ ] Schedule the Edge Function using Supabase `pg_cron`.
- [ ] Build the frontend UI component and connect to the Supabase JS client.