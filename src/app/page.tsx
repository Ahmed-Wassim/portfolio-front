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
import { listProjects, listArticles } from "@/lib/api"
import type { Project, Article } from "@/types/api"

export const dynamic = "force-dynamic"

export default async function Home() {
  // Independent fetches — one failing does not blank the whole poster
  let projects: Project[] | null = null
  let projectsOffline = false
  let articles: Article[] | null = null
  let articlesOffline = false

  try {
    const res = await listProjects()
    if (res.ok) {
      projects = res.data
    } else {
      projectsOffline = true
    }
  } catch {
    projectsOffline = true
  }

  try {
    const res = await listArticles()
    if (res.ok) {
      articles = res.data
    } else {
      articlesOffline = true
    }
  } catch {
    articlesOffline = true
  }

  const apiOnline = !projectsOffline && !articlesOffline

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Header />
      <main id="main">
        <Hero apiOnline={apiOnline} />
        <WorkSection projects={projects} offline={projectsOffline} />
        <LogsSection articles={articles} offline={articlesOffline} />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <HireMeSection />
      </main>
      <Footer />
    </>
  )
}
