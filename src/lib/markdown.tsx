import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import type { Components } from "react-markdown"
import { CopyButton } from "@/components/ui/CopyButton"
import { uploadUrl } from "@/lib/api"

// Default schema plus `loading` so inline article images can lazy load.
// Relative src values ("/uploads/x.png") already survive the default schema:
// hast-util-sanitize treats a value with no colon before the first "/" as having
// no protocol, so it is allowed.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), "loading"],
  },
}

// Shared by the public article page and the admin live preview, so the preview
// matches what readers get.
const components: Components = {
  a({ href, children, ...rest }) {
    const isExternal = href && /^https?:\/\//i.test(href)
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="flash-blue focus-brutal"
        {...rest}
      >
        {children}
      </a>
    )
  },

  pre({ children, ...rest }) {
    // Extract text from nested code element for the copy button
    let codeText = ""
    try {
      const child = children as React.ReactElement<{ children?: unknown }>
      if (child?.props?.children != null) {
        codeText = String(child.props.children)
      }
    } catch {
      // ignore
    }
    return (
      <div className="relative group">
        <pre style={{ overflowX: "auto" }} {...rest}>
          {children}
        </pre>
        {codeText && <CopyButton text={codeText} />}
      </div>
    )
  },

  code({ children, className, ...rest }) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    )
  },

  img({ src, alt, ...rest }) {
    // Article markdown stores relative paths so content survives a change of API
    // host. Resolve them against the API base for display.
    const resolved = typeof src === "string" ? uploadUrl(src) : null
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved ?? src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        style={{ maxWidth: "100%" }}
        {...rest}
      />
    )
  },
}

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  )
}
