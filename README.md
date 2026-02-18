# Smart Bookmark App

## Live URL

https://smart-bookmark-app-sepia-three.vercel.app

## GitHub Repo

https://github.com/nandanisingh/smart-bookmark-app

---

## Tech Stack

Next.js (App Router)
Supabase (Auth, Database, Realtime)
Tailwind CSS
Vercel Deployment

---

## Features

- Google OAuth Login
- Add Bookmark
- Delete Bookmark
- Private bookmarks per user
- Real-time updates
- Deployed on Vercel

---

## Problems Faced and Solutions

### Problem 1: next.config.ts not supported in Vercel

Solution:
Renamed next.config.ts to next.config.js

---

### Problem 2: Environment variables not working in Vercel

Solution:
Added NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Environment Variables

---

### Problem 3: Google OAuth not working

Solution:
Added Vercel URL in Supabase Redirect URLs

---

### Problem 4: Realtime not updating

Solution:
Enabled Supabase Realtime subscription

---

## How to Run Locally

npm install

npm run dev
