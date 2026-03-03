# AGENTS.md

## Cursor Cloud specific instructions

This is an AI-powered Chinese Legal Document Generator (AI 智能法律文书助手) built with Vite + React + TypeScript + Tailwind CSS + shadcn/ui.

### Services

| Service | Command | Port | Notes |
|---|---|---|---|
| Vite Dev Server | `npm run dev` | 8080 | Main frontend app |

The app calls a remote Supabase Edge Function for AI document generation. Supabase credentials are pre-configured in `.env`. No local database or backend setup is needed.

### Key Commands

See `package.json` scripts:
- **Dev server:** `npm run dev` (port 8080, binds to `::`)
- **Lint:** `npm run lint`
- **Test:** `npm run test` (Vitest)
- **Build:** `npm run build`

### Non-obvious Caveats

- ESLint reports 6 pre-existing errors (empty interfaces in shadcn/ui components, `no-explicit-any` in `GenerateDocument.tsx`, `no-require-imports` in `tailwind.config.ts`) and 7 warnings. These are not blocking for development.
- The project has both `package-lock.json` and `bun.lockb`; use `npm` as the primary package manager (matching `package-lock.json`).
- The AI document generation feature depends on a remote Supabase Edge Function at `https://fybcdhdmpclymvopbhwf.supabase.co/functions/v1/generate-document` which uses a `LOVABLE_API_KEY` server-side secret. This cannot be configured locally.
- Some document forms (e.g. 借款合同) have complex validation requiring all required fields including dropdown selections; the 民事起诉状 (Civil Complaint) form is straightforward for testing.
