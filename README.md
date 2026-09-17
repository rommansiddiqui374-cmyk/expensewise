# ExpenseWise India — Personal Finance Tracker (SaaS)

A full-stack expense tracker with a free tier and a ₹49/month Premium tier
(monthly reports + bill splitting), built to run entirely on free infrastructure
and accept real payments in India via Cashfree.

**Stack:** Next.js (frontend + backend API routes) · Supabase (database + auth, free)
· Cashfree (payments, free signup) · Vercel (hosting, free)

Everything below is free to set up. The only real-world cost is the small
per-transaction fee payment providers always charge (UPI is 0% on Cashfree;
cards are ~1.9%) — there is no monthly fee for any of these services at
this scale.

---

## Part 1 — What I've already built for you

- Sign up / log in (secure, handled by Supabase Auth)
- Add / delete expenses with categories, notes, dates
- Free tier: unlimited logging + a pie chart of spending by category
- Premium tier: monthly bar-chart report + bill-splitting tool
- A working payment flow: "Upgrade" button → Cashfree checkout → webhook
  automatically marks the user's account as Premium for 30 days
- Database schema with security rules so users can only ever see their own data

## Part 2 — What YOU need to do (step by step)

You have to do these steps yourself because they involve your identity,
bank account, and legal responsibility for the money — I can't create
accounts on your behalf.

### Step 1 — Create a free Supabase project (database + login system)
1. Go to https://supabase.com and sign up (free, no card required).
2. Click "New Project". Pick any name and a strong database password (save it somewhere).
3. Once it's created, go to **Project Settings → API**. Copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)
4. Go to **SQL Editor → New query**, paste the entire contents of
   `supabase/schema.sql` (included in this project), and click Run.
   This creates all your tables and security rules in one go.

### Step 2 — Create a free Cashfree account (to receive payments)
1. Go to https://merchant.cashfree.com/signup and sign up — this part is free.
2. Complete KYC: you'll need your **PAN card** and **Aadhaar** (front & back),
   plus your **bank account number and IFSC code** (this is the account that
   receives your money — you can also link a UPI ID for settlements in some
   flows, but the core payout destination is a bank account).
3. While KYC is under review (usually a few days), you can fully build and
   test everything in **Sandbox/Test mode** — no real money moves, but the
   entire flow works.
4. Once approved, go to **Developers → API Keys**:
   - Copy the **App ID** → `CASHFREE_APP_ID`
   - Copy the **Secret Key** → `CASHFREE_SECRET_KEY`
   - There are separate keys for Test mode and Live/Production mode — use
     Test keys first, switch to Live keys (and set `CASHFREE_ENV=PRODUCTION`)
     once you're ready to accept real payments.
5. Go to **Developers → Webhooks** and add a webhook pointing to:
   `https://YOUR-DEPLOYED-DOMAIN.com/api/webhook/cashfree`
   (You'll get this domain in Step 4 below — come back and add this after deploying.)

### Step 3 — Fill in your environment variables
1. In this project folder, copy `.env.local.example` to a new file named `.env.local`.
2. Fill in every value using what you copied in Steps 1 and 2.

### Step 4 — Deploy for free on Vercel
1. Push this project to a GitHub repository (create one at https://github.com if needed).
2. Go to https://vercel.com, sign up free with your GitHub account.
3. Click "Add New Project", import your repo.
4. Under "Environment Variables", paste in everything from your `.env.local` file.
5. Click Deploy. Vercel gives you a free `.vercel.app` domain immediately.
6. Update `NEXT_PUBLIC_APP_URL` in Vercel's environment variables to your real
   deployed URL, then redeploy (Vercel → Deployments → ⋯ → Redeploy).
7. Go back to Cashfree's Webhooks page (Step 2.5) and set the webhook URL
   using your real Vercel domain.

### Step 5 — Test it end-to-end
1. Visit your deployed site, sign up, log in.
2. Add a few expenses — confirm the free-tier chart works.
3. Click "Upgrade" — while in Sandbox mode, Cashfree provides test card/UPI
   numbers in their docs (search "Cashfree test credentials") so you can
   simulate a successful payment without real money.
4. Confirm your account flips to "PREMIUM" and Reports/Split Bills unlock.
5. Once everything works, switch to Live Cashfree keys and go live for real.

### Step 6 — Running locally to make changes (optional)
If you want to edit the code on your own computer before deploying:
1. Install Node.js (free) from https://nodejs.org
2. In this folder, run: `npm install`
3. Run: `npm run dev`
4. Open http://localhost:3000

---

## Notes & honest caveats

- **Transaction fees**: Cashfree isn't 0% on everything — UPI is free, but
  cards/other methods carry a small % fee that's deducted before settlement.
  This is standard for every payment provider in India (Razorpay, PayU, etc. all charge similarly).
- **Compliance**: Once you're accepting real payments regularly, look into
  whether you need GST registration based on your revenue — rules depend on
  your total turnover and business structure. This isn't something I can
  determine for you; a CA (chartered accountant) can advise cheaply.
- **Subscriptions**: This build charges Premium as a one-time ₹49 payment
  that unlocks 30 days (not an auto-recurring subscription). True
  auto-recurring billing requires Cashfree's separate Subscriptions/eMandate
  product, which needs additional approval — a reasonable next upgrade once
  you have real users.
- **Free tier limits**: Supabase's free tier and Vercel's free tier both have
  generous but real limits (database size, bandwidth, function executions).
  Fine for launching and getting initial users; you'd upgrade to a paid tier
  only once you have meaningful traffic.
