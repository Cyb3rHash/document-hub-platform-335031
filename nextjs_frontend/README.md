# DocumentHub Frontend (Vite + React + Tailwind)

This container is a **Vite-based React SPA** using **Tailwind CSS**, **Framer Motion**, and **Font Awesome**.

## Routes

- `/` Landing
- `/login` Login
- `/signup` Signup
- `/app` Dashboard
- `/app/explore` Explore
- `/app/upload` Upload
- `/app/viewer` Viewer
- `/app/admin` Admin

## Environment variables

This container uses the existing `NEXT_PUBLIC_*` variables (provided by the platform `.env` for this container):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (preferred) or `NEXT_PUBLIC_SUPABASE_KEY` (fallback)
- `NEXT_PUBLIC_FRONTEND_URL` or `NEXT_PUBLIC_SITE_URL` (used for Supabase email redirect)

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
