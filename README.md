# Tarot Journal Web App

Tarot Journal is a React + Vite web application for tracking card pulls and guided reflections.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables from the example file:

```bash
cp .env.example .env
```

3. In `.env`, add your Supabase project values:

```bash
VITE_SUPABASE_URL=https://mktgjrmtomuezomljvxs.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_278rfbo_XxOP9G7nTiydUA_3nXnnsgN
```

4. Start the dev server:

```bash
npm run dev
```

## Supabase Integration

- Supabase client: `src/lib/supabaseClient.js`
- Environment variables: `.env` (local), `.env.example` (template)

When running in development, the app performs a Supabase health check on startup and logs the result in the browser console:

- `Supabase connection is healthy.` means the local connection is configured and reachable.
- Warning messages indicate missing variables or a failed connection check.

## Available Scripts

- `npm run dev`: Start local development server
- `npm run build`: Build production assets
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
