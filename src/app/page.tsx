import { Toaster } from "sonner"
import { Header } from "@/components/public/Header"
import { Hero } from "@/components/public/Hero"
import { WorkSection } from "@/components/public/WorkSection"
import { LogsSection } from "@/components/public/LogsSection"
import { AboutSection } from "@/components/public/AboutSection"
import { SkillsSection } from "@/components/public/SkillsSection"
import { ExperienceSection } from "@/components/public/ExperienceSection"
import { HireMeSection } from "@/components/public/HireMeSection"
import { Footer } from "@/components/public/Footer"
import { listProjects, listArticles, getProfile, listAbout } from "@/lib/api"
import { site } from "@/config/site"
import type { Project, Article, Profile, AboutItem } from "@/types/api"

export const dynamic = "force-dynamic"

export default async function Home() {
  // All fetches are independent — one failure never blanks the whole poster
  let projects: Project[] | null = null
  let projectsOffline = false
  let articles: Article[] | null = null
  let articlesOffline = false
  let profile: Profile | null = null
  let aboutItems: AboutItem[] | null = null

  try {
    const res = await listProjects()
    if (res.ok) projects = res.data
    else projectsOffline = true
  } catch {
    projectsOffline = true
  }

  try {
    const res = await listArticles()
    if (res.ok) articles = res.data
    else articlesOffline = true
  } catch {
    articlesOffline = true
  }

  try {
    const res = await getProfile()
    if (res.ok) profile = res.data
  } catch {
    // fall back to site.ts values below
  }

  try {
    const res = await listAbout()
    if (res.ok) aboutItems = res.data
  } catch {
    // fall back to site.ts values below
  }

  const apiOnline = !projectsOffline && !articlesOffline

  // Fall back to static config when API is unavailable
  const tagline = profile?.tagline ?? site.tagline
  const stack = profile?.stack.length ? profile.stack : [...site.stack]
  const aboutParagraphs: string[] = aboutItems?.length
    ? aboutItems.map((a) => a.content)
    : [...site.about]

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Header />
      <main id="main">
        <Hero apiOnline={apiOnline} tagline={tagline} stack={stack} />
        <WorkSection projects={projects} offline={projectsOffline} />
        <LogsSection articles={articles} offline={articlesOffline} />
        <AboutSection paragraphs={aboutParagraphs} />
        <SkillsSection />
        <ExperienceSection />
        <HireMeSection />
      </main>
      <Footer />
    </>
  )
}
