# Deployment Guide: Tenachin AI on Vercel & Supabase

## Prerequisites
- GitHub account (for Vercel integration)
- Supabase account (for database)
- OpenAI API key
- Node.js installed locally

---

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Project name**: `tenachin-ai`
   - **Database password**: Create a strong password
   - **Region**: Select closest to your users
5. Wait for project initialization (~2 minutes)

### 1.2 Get Supabase Credentials
1. Go to Project Settings → API
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3 Run Database Migrations
1. In Supabase dashboard, go to SQL Editor
2. Create a new query and run the migration file:
   ```sql
   -- Copy content from: supabase/migrations/20260606000000_init.sql
   ```
3. Or use the SQL editor to paste and execute the schema

**Important Tables to Create:**
- `profiles` - User information
- `food_logs` - Food scan records
- `symptom_logs` - Symptom analysis records
- `leaderboard` - User rankings

---

## Step 2: Get OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in with your OpenAI account
3. Click "Create new secret key"
4. Copy the key (you won't be able to see it again!)
5. Store it securely

---

## Step 3: Local Development Setup

### 3.1 Create .env.local
In the project root, create a `.env.local` file:
```
# .env.local (DO NOT COMMIT THIS FILE)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...your_anon_key_here
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.2 Test Locally
```bash
npm install
npm run build
npm run dev
```

Visit `http://localhost:3001` and verify the app works.

---

## Step 4: Push to GitHub

### 4.1 Initialize Git Repository
```bash
cd "c:\Users\abina\Desktop\Tenachin AI"
git init
git add .
git commit -m "Initial commit: Tenachin AI health platform"
```

### 4.2 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create repository: `tenachin-ai`
3. **Do NOT initialize with README** (we already have one)
4. Follow the instructions to push your local repo:
```bash
git remote add origin https://github.com/YOUR_USERNAME/tenachin-ai.git
git branch -M main
git push -u origin main
```

---

## Step 5: Deploy to Vercel

### 5.1 Import Project to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub account
3. Click "Add New..." → "Project"
4. Import the `tenachin-ai` repository
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)

### 5.2 Set Environment Variables
Before deploying, add environment variables:
1. In Vercel project settings, go to "Environment Variables"
2. Add these three variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   OPENAI_API_KEY = your_openai_api_key
   ```
3. Make sure `NEXT_PUBLIC_*` variables are marked as "Public"

### 5.3 Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Once complete, you'll get a live URL like: `https://tenachin-ai.vercel.app`

---

## Step 6: Update Supabase Redirect URLs

After deploying to Vercel:

1. Go to Supabase dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Redirect URLs":
   ```
   https://your-vercel-url.vercel.app
   https://your-vercel-url.vercel.app/auth/callback
   ```

---

## Step 7: Verify Deployment

✅ **Checklist:**
- [ ] Visit your Vercel URL and see the landing page
- [ ] Test the symptom chatbot (should work with or without OpenAI key - uses mock fallback)
- [ ] Test the food scanner
- [ ] Check browser console for errors
- [ ] Test on mobile device

---

## Troubleshooting

### Issue: "Supabase connection failed"
**Solution**: Verify environment variables are set correctly in Vercel
```bash
# Check locally first
npm run dev
```

### Issue: "OPENAI_API_KEY is not defined"
**Solution**: This is expected! The app uses mock data by default. To enable real AI:
1. Add your OpenAI key to Vercel environment variables
2. Redeploy

### Issue: "Build failed on Vercel"
**Solution**: 
1. Check build logs in Vercel dashboard
2. Verify Next.js version compatibility
3. Run `npm run build` locally to debug

### Issue: "Database tables not found"
**Solution**: 
1. Go to Supabase SQL Editor
2. Run the migration from `supabase/migrations/20260606000000_init.sql`

---

## Environment Variables Reference

| Variable | Description | Type | Example |
|----------|-------------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Public | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Public | `eyJhbGc...` |
| `OPENAI_API_KEY` | OpenAI API secret | Secret | `sk-proj-...` |

---

## Production Best Practices

1. **Never commit .env files** - Add to `.gitignore`
2. **Use strong database passwords** - Change default Supabase password
3. **Enable Supabase Row Level Security (RLS)** - Protect user data
4. **Monitor API usage** - Track OpenAI and Supabase costs
5. **Set up error monitoring** - Consider Sentry or similar
6. **Enable HTTPS** - Vercel handles this automatically
7. **Schedule database backups** - Use Supabase backup feature

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- OpenAI Docs: https://platform.openai.com/docs

---

## Need Help?

If deployment fails:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure Supabase project is active
4. Test locally with `npm run dev` first

---

## CI / CD Automation (GitHub)

This repository includes two GitHub Actions workflows to automate deployment and database migrations when you push to `master`:

- `.github/workflows/vercel-deploy.yml` — Deploys the app to Vercel using the Vercel Action. Requires these **repository secrets** to be set in GitHub:
   - `VERCEL_TOKEN` — a personal token generated in Vercel (Account Settings → Tokens)
   - `VERCEL_ORG_ID` — your Vercel organization ID
   - `VERCEL_PROJECT_ID` — the Vercel project ID for this repo

- `.github/workflows/supabase-migrate.yml` — Runs Supabase CLI to push migrations. Requires these **repository secrets**:
   - `SUPABASE_URL` — your Supabase project reference (project ref)
   - `SUPABASE_SERVICE_ROLE_KEY` — the service role key (keep secret)

How to set GitHub secrets:
1. Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret
2. Add each secret above with the exact names

Important: These workflows will only run after you push the changes to GitHub. To push now:

```bash
git add .
git commit -m "chore(ci): add Vercel and Supabase deployment workflows"
git push origin master
```

After push:
1. The Vercel workflow will trigger and deploy the app (if `VERCEL_*` secrets are present).
2. The Supabase migration workflow will attempt to run migrations if `SUPABASE_*` secrets are present.

If you prefer Vercel's native Git integration (recommended), connect the GitHub repository in the Vercel dashboard and set the same environment variables in the Vercel project settings instead of using the `VERCEL_*` Action secrets.
