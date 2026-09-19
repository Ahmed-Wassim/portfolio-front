import type { Metadata } from "next"
import type { ReactNode } from "react"
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google"
import { ThemeProvider } from "@/lib/theme"
import "./globals.css"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AHMEDWASSIM.exe",
  description: "Backend Software Engineer — Laravel · Go · PostgreSQL · Redis · Docker",
}

// Injected before first paint — sets data-theme on <html> with no flash.
// Reads localStorage first, then prefers-color-scheme, then defaults to light.
const themeScript = `(function(){try{var s=localStorage.getItem('portfolio.theme');if(s==='dark'||s==='light'){document.documentElement.setAttribute('data-theme',s);return;}if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');return;}}catch(e){}document.documentElement.setAttribute('data-theme','light');})()`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${ibmPlexMono.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 btn-brutal btn-brutal-main focus-brutal"
        >
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
