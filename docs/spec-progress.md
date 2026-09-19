# PROGRESS.md

Living checklist. After finishing a GUIDE.md task, flip its box here and add a one-line note below. When everything is `[x]`, say so in the session end summary.

Status legend: `[ ]` todo · `[x]` done · `[~]` in progress

## A. Scaffold
- [x] `A1` create-next-app (App Router, TS, Tailwind v4)
- [x] `A2` `.env.local` + dev port 3001
- [x] `A3` install swr, react-hook-form, zod, sonner, lucide-react, react-markdown, remark-gfm, rehype-sanitize
- [x] `A4` git init + initial commit + placeholder cv.pdf

## B. Design system
- [x] `B1` tokens (incl. status/danger/success/ghost) + brutal utilities in globals.css
- [x] `B2` fonts + no-FOUC theme script + skip link
- [x] `B3` theme provider/toggle (storage fallback)
- [x] `B4` src/config/site.ts (all static copy incl. tagline/watermark/empty strings)
- [x] `B5` lib/utils + types/api

## C. Public poster page
- [x] `C1` Reveal (IO) wrapper + reduced-motion
- [x] `C2` Header + Footer + scroll-margin + HIRE focus
- [x] `C3` Hero (StatusPill, tagline slab, CTA variants, deco, watermark)
- [x] `C4` lib/api.ts public + admin fetchers (`ok`/`error`, uploadUrl, GORM normalize)
- [x] `C5` PlaceholderBlock + img onError
- [x] `C6` WorkSection (sort, empty, offline)
- [x] `C7` LogsSection (empty skeletons, offline)
- [x] `C8` About / Skills / Experience
- [x] `C9` HireMeSection + form (zod limits, pending lock)
- [x] `C10` page.tsx wiring + anchors + independent fetches

## D. Detail pages
- [x] `D1` /projects/[id]
- [x] `D2` /articles/[slug] (sanitized markdown + link rel)
- [x] `D3` brutal not-found.tsx + error.tsx

## E. Admin
- [x] `E1` login page (JWT → localStorage)
- [x] `E2` dashboard shell + sidebar + 401 toast/redirect
- [x] `E3` stats overview
- [x] `E4` projects list via GET /api/projects (+search/delete confirm)
- [x] `E5` project form (multipart, featured, image)
- [x] `E6` articles list
- [x] `E7` article form (slug 409 inline, published, markdown)
- [x] `E8` messages inbox + optimistic mark-read

## F. Polish & checks
- [x] `F1` responsive (320/375, deco hidden)
- [x] `F2` hover/motion/focus + reduced-motion + skip link
- [x] `F3` empty-DB + API-down + missing image
- [x] `F4` `npm run build` + `npm run lint` clean
- [ ] `F5` final commit

---

## Log
- [2026-09-19] Spec review: extended palette (status/danger/success/ghost), hero tagline/CTAs, and decided edge cases in context.md §11. Guide/architecture/progress updated to match. Scaffold not started.
- [2026-09-19] API contract aligned with live Go router: no admin GET projects, filename uploads, `invalid credentials`, GET admin article by id, CORS :3001. `src/lib/api.ts` + `src/types/api.ts` added.
- [2026-09-19] Full implementation complete: all C–F tasks built. Hero, WorkSection, LogsSection, About/Skills/Experience, HireMeSection, page.tsx, /projects/[id], /articles/[slug], not-found, error, admin login, dashboard shell+sidebar, stats, projects/articles CRUD forms, messages inbox. `npm run build` passes clean (13 routes). @hookform/resolvers installed. prose-brutal markdown styles added to globals.css.
