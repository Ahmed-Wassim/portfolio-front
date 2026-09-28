"use client"

import { useRef, useState } from "react"
import { Image as ImageIcon, Columns2, SquarePen, Eye } from "lucide-react"
import { toast } from "sonner"
import { uploadImages } from "@/lib/api"
import { Markdown } from "@/lib/markdown"
import { cn } from "@/lib/utils"

type Tool =
  | { kind: "wrap"; before: string; after: string; placeholder: string; label: string; title?: string }
  | { kind: "prefix"; prefix: string; label: string; title?: string }
  | { kind: "insert"; snippet: string; label: string; title?: string }
  | { kind: "image"; label: string; title?: string }

// "\0" marks where the caret should land inside an inserted block.
const CARET = "\0"

// Nested so the toolbar can render separators between groups.
const TOOL_GROUPS: Tool[][] = [
  [
    { kind: "prefix", prefix: "# ", label: "H1" },
    { kind: "prefix", prefix: "## ", label: "H2" },
    { kind: "prefix", prefix: "### ", label: "H3" },
  ],
  [
    { kind: "wrap", before: "**", after: "**", placeholder: "bold", label: "B", title: "Bold" },
    { kind: "wrap", before: "_", after: "_", placeholder: "italic", label: "I", title: "Italic" },
    { kind: "wrap", before: "~~", after: "~~", placeholder: "struck", label: "S", title: "Strikethrough" },
    { kind: "wrap", before: "`", after: "`", placeholder: "code", label: "‹›", title: "Inline code" },
  ],
  [{ kind: "wrap", before: "[", after: "](https://)", placeholder: "link text", label: "LINK", title: "Link" }],
  [
    { kind: "prefix", prefix: "> ", label: "QUOTE", title: "Blockquote" },
    { kind: "prefix", prefix: "- ", label: "UL", title: "Bullet list" },
    { kind: "prefix", prefix: "1. ", label: "OL", title: "Numbered list" },
    { kind: "prefix", prefix: "- [ ] ", label: "TASK", title: "Task list" },
  ],
  [
    { kind: "insert", snippet: "```\n" + CARET + "\n```", label: "CODE", title: "Code block" },
    { kind: "insert", snippet: "---", label: "HR", title: "Horizontal rule" },
  ],
  [{ kind: "image", label: "IMAGE", title: "Insert image" }],
]

type View = "write" | "split" | "preview"

const VIEWS: { id: View; label: string; icon: typeof Eye }[] = [
  { id: "write", label: "WRITE", icon: SquarePen },
  { id: "split", label: "SPLIT", icon: Columns2 },
  { id: "preview", label: "PREVIEW", icon: Eye },
]

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
  error?: string
  id?: string
}

export function MarkdownEditor({
  value,
  onChange,
  disabled,
  label = "CONTENT (MARKDOWN)",
  error,
  id,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<View>("split")
  const [uploading, setUploading] = useState(false)

  const words = value.trim() ? value.trim().split(/\s+/).length : 0
  const images = (value.match(/!\[[^\]]*\]\(/g) ?? []).length

  // The textarea is controlled, so the caret has to be reapplied after React
  // has committed the new value to the DOM.
  function replace(next: string, caret: number) {
    onChange(next)
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(caret, caret)
    })
  }

  /**
   * Splices a block-level snippet in at the caret, surrounded by blank lines.
   * Markdown only renders a block as its own block when it sits on its own line
   * between blank lines — otherwise it becomes inline content of the paragraph.
   */
  function insertBlock(current: string, caret: number, snippet: string) {
    const before = current.slice(0, caret)
    const after = current.slice(caret)
    const lead = before === "" || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n"
    const trail = after === "" || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n"

    const mark = snippet.indexOf(CARET)
    const text = mark === -1 ? snippet : snippet.slice(0, mark) + snippet.slice(mark + 1)

    return {
      next: before + lead + text + trail + after,
      caret: before.length + lead.length + (mark === -1 ? text.length : mark),
    }
  }

  function handleTool(tool: Tool) {
    if (disabled) return
    if (tool.kind === "image") {
      fileInputRef.current?.click()
      return
    }

    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0

    if (tool.kind === "wrap") {
      const body = value.slice(start, end) || tool.placeholder
      replace(
        value.slice(0, start) + tool.before + body + tool.after + value.slice(end),
        start + tool.before.length + body.length,
      )
      return
    }

    if (tool.kind === "insert") {
      const { next, caret } = insertBlock(value, start, tool.snippet)
      replace(next, caret)
      return
    }

    // Prefix every line the selection touches. lineStart is always a line
    // boundary, so the prefix can never glue onto the previous line.
    const lineStart = value.lastIndexOf("\n", start - 1) + 1
    const found = value.indexOf("\n", end)
    const lineEnd = found === -1 ? value.length : found
    const block = value.slice(lineStart, lineEnd) || ""
    const prefixed = block
      .split("\n")
      .map((line) => tool.prefix + line)
      .join("\n")

    replace(value.slice(0, lineStart) + prefixed + value.slice(lineEnd), lineStart + prefixed.length)
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0) return

    const toastId = toast.loading(`Uploading ${files.length} image${files.length > 1 ? "s" : ""}…`)
    setUploading(true)
    const result = await uploadImages(files)
    setUploading(false)
    toast.dismiss(toastId)

    if (!result.ok) {
      toast.error(result.error || "Failed to upload image.")
      return
    }

    // Read the live DOM value, not the `value` captured when this handler was
    // created: the upload was awaited, so the user may have kept typing.
    // Selection offsets survive the blur caused by clicking the toolbar.
    const el = textareaRef.current
    const current = el?.value ?? value
    const snippet = result.data.map((path) => `![image](${path})`).join("\n\n")
    const { next, caret } = insertBlock(current, el?.selectionStart ?? current.length, snippet)
    replace(next, caret)

    toast.success(`${result.data.length} image${result.data.length > 1 ? "s" : ""} inserted.`)
  }

  return (
    <div>
      {/* Header: label, live stats, view switch */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <label htmlFor={id} className="font-mono text-xs font-bold tracking-widest">
          {label}
        </label>

        <div className="flex items-center gap-3 font-mono text-[11px] tracking-widest text-[var(--muted)]">
          {words > 0 && <span>{words} WORDS</span>}
          {images > 0 && (
            <span className="inline-flex items-center gap-1">
              <ImageIcon size={11} aria-hidden="true" />
              {images}
            </span>
          )}
          <div role="group" aria-label="Editor layout" className="flex border-2 border-brutal">
            {VIEWS.map(({ id: v, label: text, icon: Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                title={`${text.toLowerCase()} view`}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 font-mono text-[10px] font-bold tracking-wider",
                  "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--main)]",
                  view === v
                    ? "bg-[var(--ink)] text-[var(--bg)]"
                    : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]",
                )}
              >
                <Icon size={11} aria-hidden="true" />
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* One bordered shell: the toolbar, editor and preview share it so there is
          a single divider between panes instead of stacked double borders. */}
      <div className="border-2 border-brutal bg-[var(--bg)]">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b-2 border-b-[var(--ink)] bg-[var(--panel)] p-2">
          {TOOL_GROUPS.map((group, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden="true" className="mx-1 h-5 w-0.5 bg-[var(--ghost)]" />}
              {group.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  disabled={disabled || (tool.kind === "image" && uploading)}
                  title={tool.title ?? tool.label}
                  onClick={() => handleTool(tool)}
                  className={cn(
                    "relative px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-wider whitespace-nowrap",
                    "border-2 border-brutal bg-[var(--bg)] text-[var(--ink)]",
                    "hover:bg-[var(--main)] hover:shadow-[3px_3px_0_var(--ink)]",
                    // z-10 keeps the hover shadow and focus ring from being clipped
                    // or overlapped by the next button in the row.
                    "hover:z-10 focus-visible:z-10",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--main)]",
                    "disabled:opacity-40 disabled:hover:bg-[var(--bg)] disabled:hover:shadow-none",
                    tool.kind === "image" && "bg-[var(--main)]",
                  )}
                >
                  {tool.kind === "image" && uploading ? "UPLOADING…" : tool.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className={cn("grid", view === "split" && "lg:grid-cols-2")}>
          {view !== "preview" && (
            <textarea
              id={id}
              ref={textareaRef}
              rows={view === "write" ? 32 : 30}
              value={value}
              disabled={disabled}
              spellCheck
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "w-full min-h-[30rem] bg-[var(--bg)] px-5 py-4",
                "font-mono text-[15px] leading-relaxed outline-none resize-y disabled:opacity-50",
                // Drawn inside the pane: an outside offset would add a second
                // line along the top edge, right against the toolbar.
                "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--main)]",
                view === "split" && "lg:border-r-2 lg:border-r-[var(--ink)]",
              )}
              placeholder={"Write your article here…\n\nUse the toolbar above, or plain markdown."}
            />
          )}

          {view !== "write" && (
            <div
              className={cn(
                "px-5 py-4",
                view === "split" && "lg:max-h-[48rem] lg:overflow-y-auto",
              )}
            >
              <p className="font-mono text-[10px] font-bold tracking-widest text-[var(--muted)] mb-3">
                PREVIEW
              </p>
              {value.trim() ? (
                <div className="prose-brutal">
                  <Markdown>{value}</Markdown>
                </div>
              ) : (
                <p className="font-mono text-xs text-[var(--muted)]">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={handleFiles}
      />

      {error && <p className="font-mono text-xs text-[var(--danger)] mt-1">{error}</p>}
    </div>
  )
}
