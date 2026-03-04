This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Automatic Campaign Sync

FundTracker now supports automatic campaign syncing from GlobalGiving to Supabase.

### Sync Route

- Endpoint: `/api/sync-campaigns`
- Methods: `GET`, `POST`
- Schedule: Every 12 hours via `vercel.json` cron config

### Required Environment Variables

Set these on your deployment/project environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GLOBALGIVING_API_KEY`
- `CRON_SECRET` (optional but recommended)

If `CRON_SECRET` is set, call the route with:

`Authorization: Bearer <CRON_SECRET>`

### Manual Sync Test

You can manually trigger sync:

```bash
curl -X POST http://localhost:3000/api/sync-campaigns
```

The response includes sync stats:

- `fetched`
- `inserted`
- `updated`
- `errors`

## Supabase Migration: Campaign Constraints and Indexes

Migration file:

- `supabase/migrations/202603040001_campaigns_constraints_indexes.sql`

What it does:

- Ensures `campaigns.id` is `PRIMARY KEY`
- Adds `external_id` column (if missing)
- Adds `UNIQUE (external_id)` when duplicate-free
- Adds indexes for `trend_score`, `category`, `created_at`

### Apply with Supabase SQL Editor

1. Open Supabase Dashboard → SQL Editor
2. Paste migration SQL from the file above
3. Run query

### Apply with Supabase CLI (optional)

```bash
supabase db push
```

### Verify after apply

Run these checks in SQL Editor:

```sql
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'public.campaigns'::regclass;

SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'campaigns';
```
