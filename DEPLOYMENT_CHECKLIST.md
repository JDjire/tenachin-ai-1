# 🚀 Tenachin AI - Deployment Checklist

## Pre-Deployment Setup

### Step 1: Create Accounts (5 minutes)
- [ ] Sign up for [Supabase](https://supabase.com) (free tier available)
- [ ] Sign up for [Vercel](https://vercel.com) (free tier available)
- [ ] Get OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)

### Step 2: Set Up Supabase (10 minutes)
- [ ] Create new Supabase project
- [ ] Copy Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Go to SQL Editor and run: `supabase/migrations/20260606000000_init.sql`
- [ ] Wait for tables to be created
- [ ] Verify tables exist in Database view

### Step 3: Local Testing (5 minutes)
```bash
cd "c:\Users\abina\Desktop\Tenachin AI"

# Create .env.local file with:
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
# OPENAI_API_KEY=your_key

npm install
npm run build
npm run dev
# Test at http://localhost:3001
```

### Step 4: Push to GitHub (5 minutes)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tenachin-ai.git
git branch -M main
git push -u origin main
```

### Step 5: Deploy to Vercel (10 minutes)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Select your `tenachin-ai` GitHub repo
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (Public)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Public)
   - `OPENAI_API_KEY` (Sensitive)
5. Click Deploy
6. Wait ~3 minutes for build

### Step 6: Post-Deployment (5 minutes)
- [ ] Test the live URL
- [ ] Check console for errors (F12)
- [ ] Test symptom chatbot
- [ ] Test food scanner
- [ ] Test on mobile

---

## Environment Variables Reference

| Variable | Where to Get | Sensitivity |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API | Public |
| `OPENAI_API_KEY` | OpenAI API Keys | **SECRET** |

---

## Common Issues & Solutions

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Run `npm run build` locally first
- Clear cache: Vercel Settings → Advanced → Clear Cache

**"Supabase not configured":**
- Verify env vars are set in Vercel
- Wait ~2 minutes for new deploy to take effect
- Clear browser cache

**Database tables not found:**
- Go to Supabase SQL Editor
- Copy-paste entire migration file
- Execute and wait for completion

**OpenAI features not working:**
- That's OK! App uses mock data by default
- Add your OpenAI key to enable real AI

---

## Cost Breakdown (Monthly Estimates)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Vercel** | ✅ Included | $20+/month |
| **Supabase** | ✅ 500 MB DB | Pay as you grow |
| **OpenAI** | $0 (separate) | $0.01 - $2 per 1K tokens |

*All services offer generous free tiers for development*

---

## Support Resources

- 📖 [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 📚 [Vercel Docs](https://vercel.com/docs)
- 📚 [Supabase Docs](https://supabase.com/docs)
- 📚 [Next.js Docs](https://nextjs.org/docs)

---

## Final Checklist Before Launch

- [ ] All env vars configured in Vercel
- [ ] Supabase database tables created
- [ ] GitHub repository is public (or private if needed)
- [ ] Tested locally with `npm run dev`
- [ ] Tested on Vercel URL
- [ ] Mobile responsiveness verified
- [ ] No console errors

---

**Total Setup Time: ~40 minutes**

Good luck with your deployment! 🎉
