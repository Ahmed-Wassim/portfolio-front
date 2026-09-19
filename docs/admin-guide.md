# ADMIN GUIDE

```
█████████████████████████████████████████
█                                       █
█   ADMIN STATUS: ONLINE                █
█   DASHBOARD — PROJECTS, LOGS, INBOX   █
█                                       █
█████████████████████████████████████████
```

---

## OVERVIEW

The admin dashboard lives at `/admin`. It is a client-rendered SWR app behind JWT auth. All data mutations (create, update, delete) hit the Go API. The public poster page reflects changes immediately on next load.

---

## LOGIN

**URL:** `/admin/login`

```
Email:    wassim@wassim.com
Password: 123456789
```

On success the API returns a JWT (HS256, 24h). The token is stored in `localStorage` under the key `portfolio.token`. After login you are redirected to `/admin`.

**Error states:**

| API response | Toast shown |
|---|---|
| `invalid credentials` | "invalid credentials" |
| `invalid request data` | "invalid request data" |
| Network failure | "not found" |

---

## SIDEBAR NAV

```
┌──────────────────────┐
│  AHMEDWASSIM.exe     │
├──────────────────────┤
│  Dashboard           │
│  Projects            │
│  Articles            │
│  Messages  [3]       │  ← unread badge (caps at 99+)
├──────────────────────┤
│  Logout              │
└──────────────────────┘
```

**Logout** clears the token from localStorage and redirects to `/admin/login`. There is no backend logout endpoint.

**Auth guard:** If `portfolio.token` is missing from localStorage, any admin route immediately redirects to `/admin/login`. A mid-session `401` response does the same — clears the token, shows a toast, and redirects.

---

## DASHBOARD

**URL:** `/admin`

Shows three stat cards pulled from `GET /api/admin/dashboard`:

| Card | Value |
|---|---|
| Projects | total project count |
| Articles | total article count |
| Unread Messages | messages where `is_read = false` |

---

## PROJECTS

**URL:** `/admin/projects`

### List

- Loaded via SWR from **public** `GET /api/projects` (no admin GET endpoint exists)
- Client-side search/filter on title
- Sorted by `created_at DESC`, featured first (same as public poster)
- Each row shows: title, featured badge, created date, Edit / Delete

### Create

Click **New Project** → opens the project form.

| Field | Required | Notes |
|---|---|---|
| Title | ✓ | |
| Description | ✓ | |
| Link | | external project URL |
| GitHub | | repo URL |
| Featured | | toggle — promoted to top of WORK section |
| Image | | jpg/jpeg/png/webp/gif; preview before upload |

Submitted as `multipart/form-data`. `featured` is sent as `"true"` or `"false"` (string).

### Edit

Opens the same form pre-populated. Omit the image field to keep the existing one.

### Delete

Requires confirmation before sending `DELETE /api/admin/projects/:id`. Uses a confirm dialog — no accidental deletes.

### Image handling

- Preview is shown before submit
- Obviously non-image files are rejected client-side
- Unsupported type on backend → toast `"unsupported image format"`
- Broken/missing images on the public site show a `PlaceholderBlock`

---

## ARTICLES (LOGS)

**URL:** `/admin/articles`

### List

- Loaded via SWR from `GET /api/admin/articles` (includes unpublished drafts)
- Client-side search on title
- Each row shows: title, slug, published badge, date, Edit / Delete

### Create

Click **New Article** → opens the article form.

| Field | Required | Notes |
|---|---|---|
| Title | ✓ | |
| Slug | ✓ | auto-generated from title, editable; must be unique |
| Content | | markdown body (GFM supported) |
| Published | | toggle — only published articles appear on the public LOGS section |
| Image | | optional header image |

If the slug is already taken, the API returns `409`. The error is shown **inline on the slug field**, not as a generic toast.

### Edit

Same form pre-populated. `published` is always sent on PUT (required by the API).

### Slug rules

- Auto-generated from title on create (editable before submit)
- Unique across all articles
- `409 slug already exists` → inline error on the field, not a toast

---

## MESSAGES (INBOX)

**URL:** `/admin/messages`

### List

All contact form submissions. Unread messages are visually emphasized (ink border or bold).

Columns: name, email, subject, date, read status

### Read a message

Click a row to expand the subject + body.

### Mark as read

**Mark Read** button sends `PATCH /api/admin/messages/:id`. The update is **optimistic** — the UI updates immediately, then SWR revalidates to sync with the server.

The unread badge in the sidebar updates after revalidation.

---

## EDGE CASES

**Token expired mid-session**
If your 24h JWT expires while the dashboard is open, the next SWR request returns `401`. The central error handler clears the token, shows a toast, and redirects to login. You do not lose unsaved work in open forms if you act before the redirect.

**`99+` unread badge**
The sidebar caps the unread count display at `99+`. The actual count is used for fetching — only the label is capped.

**Article slug conflict**
If you edit a slug to match an existing one and save, the API returns `409`. This is shown inline on the slug field so you can correct it without losing the rest of the form.

**Image type rejection**
Non-image files are rejected client-side before the request is sent. If the server still rejects the type, a toast shows `"unsupported image format"`.

**Network down during CRUD**
Mutations fail gracefully with a toast. SWR data stays stale until connection is restored and the key revalidates.

**Duplicate form submission**
Submit buttons are disabled while a request is pending. Double-submit is not possible.

---

## WHAT THE ADMIN CAN NOT DO

These are explicit non-goals — do not expect them:

- No refresh token flow — after 24h you log in again
- No pagination — all items are listed
- No multi-image article bodies — one image per article
- No server-side sessions — token is localStorage only
- No backend logout endpoint — logout = clear token locally

---

```
[VIEW WORK]  [DOWNLOAD CV ↓]
```
