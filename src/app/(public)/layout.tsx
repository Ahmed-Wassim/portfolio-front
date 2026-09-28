import { Toaster } from "sonner"

import { Header } from "@/components/public/Header"
import { Footer, type FooterSocial } from "@/components/public/Footer"
import { BackToTop } from "@/components/ui/BackToTop"
import { listSocials } from "@/lib/api"

/**
 * Chrome for every public page.
 *
 * Header, Footer, BackToTop and the Toaster were previously assembled by hand
 * in five pages, and three of them rendered their own <Toaster>, so a toast
 * raised on one route behaved differently from another.
 *
 * Socials are fetched here so the footer is consistent across routes; a failure
 * falls back to the static list in site.ts rather than dropping the links.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await listSocials({ revalidate: 60 })
  const socials: FooterSocial[] = result.ok
    ? result.data.map((s) => ({
        label: s.platform,
        href: s.url,
        iconKey: s.icon || s.platform,
      }))
    : []

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Header />
      {children}
      <Footer socials={socials} />
      <BackToTop />
    </>
  )
}
