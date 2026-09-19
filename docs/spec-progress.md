# PROGRESS.md

Living checklist. After finishing a GUIDE.md task, flip its box here and add a one-line note below. When everything is `[x]`, say so in the session end summary.

Status legend: `[ ]` todo · `[x]` done · `[~]` in progress

## A. Scaffold
- [ ] `A1` create-next-app (App Router, TS, Tailwind v4)
- [ ] `A2` `.env.local` + dev port 3001
- [ ] `A3` install swr, react-hook-form, zod, sonner, lucide-react, react-markdown, remark-gfm, rehype-sanitize
- [ ] `A4` git init + initial commit + placeholder cv.pdf

## B. Design system
- [ ] `B1` tokens (incl. status/danger/success/ghost) + brutal utilities in globals.css
- [ ] `B2` fonts + no-FOUC theme script + skip link
- [ ] `B3` theme provider/toggle (storage fallback)
- [ ] `B4` src/config/site.ts (all static copy incl. tagline/watermark/empty strings)
- [ ] `B5` lib/utils + types/api

## C. Public poster page
- [ ] `C1` Reveal (IO) wrapper + reduced-motion
- [ ] `C2` Header + Footer + scroll-margin + HIRE focus
- [ ] `C3` Hero (StatusPill, tagline slab, CTA variants, deco, watermark)
- [x] `C4` lib/api.ts public + admin fetchers (`ok`/`error`, uploadUrl, GORM normalize)
- [ ] `C5` PlaceholderBlock + img onError
- [ ] `C6` WorkSection (sort, empty, offline)
- [ ] `C7` LogsSection (empty skeletons, offline)
- [ ] `C8` About / Skills / Experience
- [ ] `C9` HireMeSection + form (zod limits, pending lock)
- [ ] `C10` page.tsx wiring + anchors + independent fetches

## D. Detail pages
- [ ] `D1` /projects/[id]
- [ ] `D2` /articles/[slug] (sanitized markdown + link rel)
- [ ] `D3` brutal not-found.tsx + error.tsx

## E. Admin
- [ ] `E1` login page (JWT → localStorage)
- [ ] `E2` dashboard shell + sidebar + 401 toast/redirect
- [ ] `E3` stats overview
- [ ] `E4` projects list via GET /api/projects (+search/delete confirm)
- [ ] `E5` project form (multipart, featured, image)
- [ ] `E6` articles list
- [ ] `E7` article form (slug 409 inline, published, markdown)
- [ ] `E8` messages inbox + optimistic mark-read

## F. Polish & checks
- [ ] `F1` responsive (320/375, deco hidden)
- [ ] `F2` hover/motion/focus + reduced-motion + skip link
- [ ] `F3` empty-DB + API-down + missing image
- [ ] `F4` `npm run build` + `npm run lint` clean
- [ ] `F5` final commit

---

## Log
- [2026-09-19] Spec review: extended palette (status/danger/success/ghost), hero tagline/CTAs, and decided edge cases in context.md §11. Guide/architecture/progress updated to match. Scaffold not started.
- [2026-09-19] API contract aligned with live Go router: no admin GET projects, filename uploads, `invalid credentials`, GET admin article by id, CORS :3001. `src/lib/api.ts` + `src/types/api.ts` added.
