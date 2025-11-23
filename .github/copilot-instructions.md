<!-- Copilot / AI agent instructions for the boston-cc repository -->
# Repository Snapshot

This is a Next.js (app router) TypeScript project located under `src/app`.
Key files to reference when making UI or routing changes:
- `package.json` — scripts: `dev`, `build`, `start`, `lint`.
- `tsconfig.json` — strict TypeScript, path alias `@/*` -> `src/*`.
- `next.config.ts` — `reactCompiler: true` is enabled.
- `src/app/layout.tsx` — app-level layout and global font imports.
- `src/app/page.tsx` — root route; use as an example for styles and image usage.
- `src/app/globals.css` — global styles and Tailwind entry point.
- `public/` — static assets referenced via `/` (e.g., `next.svg`, `vercel.svg`).

## Big-picture architecture (what matters to an agent)
- App router (Next.js `app/`) is used; routes are file-system based under `src/app`.
- React Server Components are the default. If a component needs client behavior, add `"use client"` at the top.
- TailwindCSS + PostCSS are present (see `postcss.config.mjs` / `tailwindcss` in devDeps). Styles are applied mostly via Tailwind classes in TSX.
- Fonts are loaded using `next/font/google` (see `layout.tsx` for `Geist` usage).

## Developer workflows (commands the agent can recommend/run)
- Development server: `npm run dev` (runs `next dev`).
- Build for production: `npm run build` (runs `next build`).
- Start production server: `npm run start` (runs `next start`).
- Linting: `npm run lint` (invokes `eslint` as configured). If a path is needed: `npx eslint . --ext .ts,.tsx`.

When generating code or running scripts, prefer using the `npm` scripts above so output is consistent with local expectations.

## Project-specific conventions and patterns
- File locations: prefer adding UI components under `src/components` or colocated inside `src/app/<route>/` depending on whether the component is route-specific.
- Import alias: use `@/` to reference files in `src` (e.g., `import Button from '@/components/Button'`). This maps to `tsconfig.json` paths.
- Server vs Client: default to server components for new files. Only add `"use client"` when you need state, effects, or browser-only APIs.
- Styling: use Tailwind classes directly in TSX. Global styles and Tailwind imports belong in `src/app/globals.css`.
- Images and static assets: use `next/image` referencing files in `public/` (e.g., `<Image src="/next.svg" />`).

## Integration points & dependencies
- Next.js (v16) and React (v19) — be mindful of API differences from older versions.
- TailwindCSS and PostCSS for styling.
- `next/font` usage for font optimization.
- Deployment target is typically Vercel (README suggests Vercel); keep serverless-friendly code and avoid node-only native modules in client routes.

## Practical examples (copyable patterns)
- Server component route (default file):

  - `src/app/page.tsx` — minimal route that uses Tailwind, `next/image`, and route-level markup.

- App layout with fonts and globals:

  - `src/app/layout.tsx` — sets HTML/body and includes `./globals.css` and `next/font` usage.

- Import alias example:

  - `import MyComp from '@/components/MyComp';`

## What to avoid / watch-for
- Do not assume client-side runtime for new files — add `"use client"` only when necessary.
- Linting is available but the `lint` script calls plain `eslint`; call with explicit paths if you see no output.
- TypeScript is `strict: true` and `noEmit: true`; generated code must type-check.

## If you need to modify tooling or add tests
- Look at `eslint.config.mjs` and `postcss.config.mjs` for existing config patterns.
- This repo currently has no test runner defined — add `vitest/jest` and update `package.json` scripts if you need tests.

## Quick checklist for PRs the agent helps create
- Type-check locally or ensure `tsc` passes (`npm run build` will run Next's build which checks types under current setup).
- Use `@/` path alias for imports from `src`.
- Keep server/client boundaries explicit (`"use client"`).
- Reference `src/app/layout.tsx` and `src/app/page.tsx` for structure and styling examples.

If anything above is unclear or you want the agent to follow stricter rules (naming, folder layout, tests), tell me which areas to enforce and I will iterate.
