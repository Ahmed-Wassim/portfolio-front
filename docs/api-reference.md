# API REFERENCE

```
█████████████████████████████████████████
█                                       █
█   BACKEND STATUS: ONLINE              █
█   Go + Gin + PostgreSQL — PORT 9999   █
█                                       █
█████████████████████████████████████████
```

**Base URL:** `http://localhost:9999`
**Auth:** `Authorization: Bearer <jwt>` on all `/api/admin/*` routes except login.
**Content-Type:** JSON unless marked multipart.

---

## ENDPOINTS AT A GLANCE

```
PUBLIC
  GET    /api/projects
  GET    /api/projects/:id
  GET    /api/articles
  GET    /api/articles/:slug
  POST   /api/contact

AUTH
  POST   /api/admin/login

ADMIN (protected — Bearer token required)
  GET    /api/admin/dashboard
  POST   /api/admin/projects
  PUT    /api/admin/projects/:id
  DELETE /api/admin/projects/:id
  GET    /api/admin/articles
  GET    /api/admin/articles/:id
  POST   /api/admin/articles
  PUT    /api/admin/articles/:id
  DELETE /api/admin/articles/:id
  GET    /api/admin/messages
  PATCH  /api/admin/messages/:id
  GET    /api/admin/tags
  PATCH  /api/admin/tags/:id
  DELETE /api/admin/tags/:id
  POST   /api/admin/uploads/images

UPLOADS
  GET    /uploads/:filename
```

---

## PUBLIC ENDPOINTS

### `GET /api/projects`

Returns all projects sorted by `created_at DESC`.

**Response 200**
```json
{
  "projects": [
    {
      "ID": 1,
      "title": "My Project",
      "description": "...",
      "image": "uuid.png",
      "link": "https://...",
      "github": "https://github.com/...",
      "featured": true,
      "CreatedAt": "2026-08-01T00:00:00Z",
      "UpdatedAt": "2026-08-01T00:00:00Z"
    }
  ]
}
```

> Note: GORM embeds PascalCase keys (`ID`, `CreatedAt`, `UpdatedAt`). `lib/api.ts` normalizes these automatically before the frontend ever reads them.

---

### `GET /api/projects/:id`

Returns a single project by numeric ID.

**Response 200**
```json
{ "project": { ...same shape as above... } }
```

**Response 404**
```json
{ "error": "not found" }
```

---

### `GET /api/articles`

Returns published articles only, sorted by `created_at DESC`.

**Response 200**
```json
{
  "articles": [
    {
      "ID": 1,
      "title": "Log Entry",
      "slug": "log-entry",
      "content": "## Markdown body",
      "image": "uuid.png",
      "published": true,
      "CreatedAt": "2026-08-14T00:00:00Z",
      "UpdatedAt": "2026-08-14T00:00:00Z"
    }
  ]
}
```

---

### `GET /api/articles/:slug`

Returns a single published article by slug.

**Response 200**
```json
{ "article": { ...same shape as above... } }
```

**Response 404**
```json
{ "error": "not found" }
```

---

### `POST /api/contact`

Sends a contact message. Lands in the admin Messages inbox.

**Request** `Content-Type: application/json`
```json
{
  "name":    "Ahmed Wassim",
  "email":   "hello@example.com",
  "subject": "Let's work together",
  "body":    "I'd like to discuss a project."
}
```

**Validation (client-side zod mirrors backend)**

| Field | Rule |
|---|---|
| `name` | 1–80 chars, required |
| `email` | valid email format |
| `subject` | 1–120 chars, required |
| `body` | 1–4000 chars, required |

**Response 201**
```json
{ "message": { "ID": 5, "name": "Ahmed Wassim", ... } }
```

**Response 400**
```json
{ "error": "invalid request data" }
```

---

## AUTH

### `POST /api/admin/login`

**Request** `Content-Type: application/json`
```json
{ "email": "wassim@wassim.com", "password": "123456789" }
```

**Response 200**
```json
{ "token": "eyJhbGci..." }
```
JWT is HS256, expires in 24h. Store in `localStorage` under key `portfolio.token`.

**Response 400** — malformed body
```json
{ "error": "invalid request data" }
```

**Response 401** — wrong credentials
```json
{ "error": "invalid credentials" }
```

---

## ADMIN ENDPOINTS

All routes below require: `Authorization: Bearer <token>`

Missing / expired / invalid token → `401 { "error": "unauthorized" }`

---

### `GET /api/admin/dashboard`

**Response 200**
```json
{
  "projects": 4,
  "articles": 12,
  "unread_messages": 3
}
```

---

### `POST /api/admin/projects`

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✓ | |
| `description` | string | ✓ | |
| `link` | string | | external URL |
| `github` | string | | GitHub URL |
| `featured` | string | | `"true"` or `"false"` |
| `image` | file | | jpg, jpeg, png, webp, gif |

**Response 201**
```json
{ "project": { ...project object... } }
```

---

### `PUT /api/admin/projects/:id`

Same multipart fields as POST. Omit `image` to keep the existing image.

**Response 200**
```json
{ "project": { ...updated project... } }
```

---

### `DELETE /api/admin/projects/:id`

**Response 200**
```json
{ "message": "project deleted" }
```

**Response 404**
```json
{ "error": "not found" }
```

---

### `GET /api/admin/articles`

Returns **all** articles including unpublished drafts.

**Response 200**
```json
{ "articles": [ ...article objects... ] }
```

---

### `GET /api/admin/articles/:id`

Returns article by numeric ID (not slug).

**Response 200**
```json
{ "article": { ...article object... } }
```

---

### `POST /api/admin/articles`

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✓ | |
| `slug` | string | ✓ | unique; `409` if taken |
| `content` | string | | markdown body |
| `tags` | string[] | | repeat the field once per tag. lowercased, de-duplicated, max 8 × 24 chars |
| `published` | string | | `"true"` or `"false"` |
| `image` | file | | jpg, jpeg, png, webp, gif |

**Response 201**
```json
{ "article": { ...article object... } }
```

**Response 409** — duplicate slug
```json
{ "error": "slug already exists" }
```

---

### `PUT /api/admin/articles/:id`

Same multipart fields as POST. `published` is **required** on PUT. Omit `image` to keep existing.

**Response 200**
```json
{ "article": { ...updated article... } }
```

---

### `DELETE /api/admin/articles/:id`

**Response 200**
```json
{ "message": "article deleted" }
```

---

### `POST /api/admin/uploads/images`
Uploads one or more images and returns their public paths, for embedding in
article markdown. The `image` field on `POST/PUT /api/admin/articles` only covers
the single cover image — this endpoint is how images *inside* the body get into
`/uploads`.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `images` | file[] | ✓ | repeat the field once per file. jpg, jpeg, png, webp, gif. max 5 MB each |

**Response 201**
```json
{ "images": ["/uploads/6f1a2b3c.png", "/uploads/9d8e7f6a.jpg"] }
```

Paths are **relative by design** so stored markdown does not depend on the API
host. The renderer (`src/lib/markdown.tsx`) resolves them against `apiBase()`.

****Errors:** `400` if no files were sent, if a file has a disallowed extension,
or if a file exceeds 5 MB.

---

### `GET /api/admin/tags`

Every tag in use, with usage counts. Soft-deleted articles and projects are
excluded, so a tag only reads as in use while content actually references it.

**Response 200**
```json
{ "tags": [ { "ID": 3, "name": "go", "article_count": 2, "project_count": 1 } ] }
```

Tags are returned on articles and projects as objects (`{ "ID": 3, "name": "go" }`);
the frontend normalisers flatten them to plain names for display.

---

### `PATCH /api/admin/tags/:id`

Renames a tag everywhere. **Content-Type:** `multipart/form-data`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✓ | trimmed and lowercased; `409 tag already exists` if taken |

**Response 200** → `{ "tag": { ... } }`

---

### `DELETE /api/admin/tags/:id`

Unlinks the tag from every article and project, then hard-deletes it. Hard delete
is deliberate: the unique name has to be freed so it can be reused.

**Response 204**

---

### `GET /api/admin/cv`

Returns metadata for the most recently uploaded CV, used by the dashboard panel
and the admin CV page. `404` when nothing has been uploaded.

**Response 200**
```json
{
  "cv": {
    "ID": 3,
    "CreatedAt": "2026-09-21T00:34:49Z",
    "UpdatedAt": "2026-09-22T21:23:47Z",
    "DeletedAt": null,
    "file_name": "68b2d5a4-c663-4ae7-bfc5-d78bbf879857.pdf"
  }
}
```

Timestamps come back capitalised because `gorm.Model` carries no JSON tags; the
frontend normaliser reads both spellings.

The **PDF itself** is not served from here. `GET /api/cv` forces
`Content-Disposition: attachment`, so it always downloads. For a preview, point
an iframe at the public static path `${API}/uploads/${file_name}`, which carries
no disposition header. Note that Chrome refuses to display cross-origin PDFs in
an iframe, so the dashboard also offers an OPEN button.

---

### `GET /api/admin/messages`

**Response 200**
```json
{
  "messages": [
    {
      "ID": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "subject": "Hire inquiry",
      "body": "...",
      "is_read": false,
      "CreatedAt": "2026-09-01T10:00:00Z"
    }
  ]
}
```

---

### `PATCH /api/admin/messages/:id`

Marks a message as read.

**Response 200**
```json
{ "message": { ...message with is_read: true... } }
```

---

## UPLOADS

### `GET /uploads/:filename`

Serves uploaded images. Filename is a UUID + extension, e.g. `3f2a1c-uuid.png`.

To construct the URL in the frontend:

```ts
uploadUrl(filename)
// → "http://localhost:9999/uploads/3f2a1c-uuid.png"
```

Supported extensions: `jpg`, `jpeg`, `png`, `webp`, `gif`.

Unsupported type on upload → `400 { "error": "unsupported image format" }`

Broken / missing image → frontend swaps to `PlaceholderBlock` via `img onError`.

---

## ERROR STRINGS

These are the exact strings returned in `{ "error": "..." }`. Mirror them in UI copy and toast messages.

| String | When |
|---|---|
| `unauthorized` | missing / expired / invalid Bearer token |
| `invalid credentials` | wrong email or password on login |
| `not found` | resource does not exist |
| `invalid request data` | malformed body / missing required fields |
| `invalid id` | non-numeric `:id` param |
| `slug already exists` | duplicate slug on article create/update |
| `unsupported image format` | file type not in allowed list |

---

## CORS

The backend allows `http://localhost:3001` for admin SWR calls made from the browser. Public RSC fetches run server-side and bypass CORS.

---

```
[VIEW WORK]  [DOWNLOAD CV ↓]
```
