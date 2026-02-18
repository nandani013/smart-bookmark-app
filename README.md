# Smart Bookmark App

## Live URL

https://smart-bookmark-app-sepia-three.vercel.app

## GitHub Repo

https://github.com/nandanisingh/smart-bookmark-app

---

## Tech Stack

- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- Vercel

---

## Features

- Google OAuth Login
- Add and Delete Bookmarks
- Private bookmarks per user
- Real-time updates across tabs
- Persistent login session
- Deployed on Vercel

---

## Problems Faced & Solutions

**1. Vercel build failed (next.config.ts)**  
Renamed to `next.config.js`

**2. Environment variables not working**  
Added Supabase keys in Vercel Environment Variables

**3. Google OAuth not working in production**  
Added Vercel URL in Supabase Redirect URLs

**4. Session lost after refresh**  
Used `supabase.auth.getSession()` to restore session

**5. Realtime not updating across tabs**  
Enabled bookmarks table in Supabase Replication and added realtime subscription

**6. Tailwind & font build errors**  
Fixed Tailwind config and removed unsupported font

---

## Run Locally

```bash
npm install
npm run dev
