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

## Supabase Auth Setup

Complete these steps in your Supabase project before testing auth locally.

### 1. Enable email/password auth

1. Open Supabase Dashboard -> Authentication -> Providers -> Email.
2. Enable Email provider.
3. Enable Confirm email if you want email verification before first sign-in.
4. Save the provider settings.

### 2. Enable Google OAuth

1. Open Supabase Dashboard -> Authentication -> Providers -> Google.
2. Create an OAuth client in Google Cloud Console.
3. In Google Cloud Console, add this redirect URI:

```text
https://<your-project-ref>.supabase.co/auth/v1/callback
```

4. Copy the Google client ID and client secret into the Supabase Google provider settings.
5. Save the provider settings.

### 3. Configure local redirect URLs

1. Open Supabase Dashboard -> Authentication -> URL Configuration.
2. Set the Site URL to your local Vite app while testing:

```text
http://localhost:5173
```

3. Add this additional redirect URL so OAuth and email confirmation can return to the verification screen:

```text
http://localhost:5173/sign-in
```

### 4. Verify locally

1. Run `npm install` and `npm run dev`.
2. Visit `http://localhost:5173/sign-up`.
3. Use Create account to verify email/password sign-up.
4. Visit `http://localhost:5173/sign-in`.
5. Use Sign in to verify email/password sign-in.
6. Confirm the Current session panel shows the signed-in user and provider.

## Available Scripts

- `npm run dev`: Start local development server
- `npm run build`: Build production assets
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
