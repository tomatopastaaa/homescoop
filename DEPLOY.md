# HomeScoop — Deployment Guide

## Step 1 — Supabase setup (10 min)

1. Go to https://supabase.com and create a free account
2. Click "New project" — name it `homescoop`, pick a region (Singapore ap-southeast-1)
3. Once created, go to Settings → API
4. Copy your **Project URL** and **anon public** key — you'll need these shortly
5. Go to SQL Editor → New query
6. Paste the entire contents of `supabase/schema.sql` and click Run
7. Go to Authentication → Providers → Google
8. Enable Google provider
9. You'll need a Google OAuth Client ID and Secret — see Step 2

---

## Step 2 — Google OAuth setup (10 min)

1. Go to https://console.cloud.google.com
2. Create a new project called "HomeScoop"
3. Go to APIs & Services → OAuth consent screen
   - User type: External
   - App name: HomeScoop
   - Add your email as test user
4. Go to APIs & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: Web application
   - Authorised JavaScript origins: `https://your-project.supabase.co`
   - Authorised redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret
6. Paste them into Supabase → Authentication → Providers → Google

---

## Step 3 — Deploy to Vercel (5 min)

1. Push this folder to a GitHub repository
   ```
   git init
   git add .
   git commit -m "initial commit"
   gh repo create homescoop --public --push
   ```
2. Go to https://vercel.com and sign in with GitHub
3. Click "Add New Project" → import your homescoop repo
4. Framework preset: Vite (auto-detected)
5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL        = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY   = your-anon-key
   VITE_ADMIN_EMAILS        = your@gmail.com
   ```
6. Click Deploy

Your site will be live at `https://homescoop.vercel.app`

---

## Step 4 — Update OAuth redirect URL (2 min)

Once deployed, go back to:
- Google Cloud Console → Credentials → your OAuth client
  - Add `https://homescoop.vercel.app` to Authorised JavaScript origins
  - Add `https://your-project.supabase.co/auth/v1/callback` to redirect URIs
- Supabase → Authentication → URL Configuration
  - Site URL: `https://homescoop.vercel.app`
  - Redirect URLs: `https://homescoop.vercel.app/sg`

---

## Step 5 — Set up Google Alerts (5 min)

Go to https://google.com/alerts and create the following:

| Alert | Frequency |
|-------|-----------|
| "interior designer Singapore" review | Once a day |
| "renovation Singapore" complaint | Once a day |
| "ID horror story Singapore" | Once a day |
| "reno overcharge Singapore" | Once a day |
| Each firm name you track | Once a day |

Set all to **Best results only** to avoid spam.
Hits land in your Gmail → you paste worthy ones into Admin → Inbox.

---

## Step 6 — Seed your first data

1. Go to `https://homescoop.vercel.app/sg`
2. Sign in with your Google account (you'll be auto-recognised as admin)
3. Go to `/admin` → use "Add to inbox" to paste your Reddit/HWZ finds
4. Approve them from the inbox — they'll appear on the main site instantly
5. Submit a few reviews yourself to seed the database

---

## Domain (when ready)

Once you've picked a domain:
1. Register at Namecheap or Cloudflare Registrar
2. In Vercel → your project → Settings → Domains → Add domain
3. Follow Vercel's DNS instructions
4. Update your Google OAuth and Supabase redirect URLs to the new domain

---

## Adding future markets

To add Malaysia (`/my`):
1. In Supabase SQL Editor: `INSERT INTO markets VALUES ('my', 'Malaysia', '马来西亚', true);`
2. Add a new route in `src/App.jsx`: `<Route path="/my" element={<SGPage market="my" />} />`
3. Update `SGPage.jsx` to accept and use the `market` prop

That's it. No rebrand needed.
