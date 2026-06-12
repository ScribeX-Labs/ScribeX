# ScribeX — client

Next.js (App Router) frontend for ScribeX: upload audio/video, get AWS-transcribed text, and chat with Claude over the transcript.

## Stack

- Next.js 16 + React 19, TypeScript
- Tailwind v4 + shadcn/ui (Base UI primitives)
- Firebase Auth + Firestore
- Bun for package management

## Develop

```bash
bun install
bun run dev
```

Copy the root `env.template` values into `client/.env.local` (the `NEXT_PUBLIC_*` block). At minimum you need the Firebase web config and `NEXT_PUBLIC_API_URL` pointing at the backend.

## Build

```bash
bun run build
```

## Layout

- `src/app` — routes (`/`, `/login`, `/dashboard/*`)
- `src/components` — feature components + `ui/` shadcn primitives
- `src/context` — auth and Firestore upload-data providers
- `src/lib/api.ts` — typed backend client
- `src/lib/firebase.ts` — lazy Firebase init
