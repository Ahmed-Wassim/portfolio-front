import { PlaceholderBlock } from "@/components/public/PlaceholderBlock"
import { uploadUrl } from "@/lib/api"

interface ProjectImageProps {
  /** Stored filename, already resolved by uploadUrl or null. */
  image: string | null
  title: string
}

/**
 * Project cover with a geometric fallback.
 *
 * Previously declared twice — once in WorkSection with an onError handler that
 * swapped in the placeholder, and once at the bottom of the project detail page
 * with a dead `onError={undefined}` and no fallback at all, so a broken image
 * showed a broken icon there but a placeholder on the poster.
 *
 * A plain <img> is deliberate: uploads are arbitrary user-supplied dimensions
 * served cross-origin from the Go API, and next/image would add an optimizer
 * hop for no benefit here.
 */
export function ProjectImage({ image, title }: ProjectImageProps) {
  const src = uploadUrl(image)

  if (!src) return <PlaceholderBlock className="w-full" aspect="aspect-video" />

  return (
    <div className="aspect-video w-full overflow-hidden border-b-2 border-[var(--ink)] relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Swap in the placeholder sibling without unmounting the subtree.
          const target = e.currentTarget
          target.style.display = "none"
          const placeholder = target.nextElementSibling as HTMLElement | null
          if (placeholder) placeholder.style.display = "block"
        }}
      />
      <div style={{ display: "none" }} className="absolute inset-0">
        <PlaceholderBlock className="w-full h-full" aspect="" />
      </div>
    </div>
  )
}
