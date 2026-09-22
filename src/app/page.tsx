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
import { BackToTop } from "@/components/ui/BackToTop"
import {
  listProjects,
  listArticles,
  getProfile,
  listAbout,
  listSkills,
  listExperiences,
  listSocials,
} from "@/lib/api"
import { site } from "@/config/site"
import type { Project, Article, Profile, AboutItem, SkillCategory, Experience, Social } from "@/types/api"

export const dynamic = "force-dynamic"

async function safeFetch<T>(fn: () => Promise<{ ok: boolean; data: T | null }>): Promise<T | null> {
  try {
    const res = await fn()
    return res.ok ? res.data : null
  } catch {
    return null
  }
}

export default async function Home() {
  // All fetches independent — one failure never blanks the whole poster
  const [
    projectsResult,
    articlesResult,
    profile,
    aboutItems,
    skillCategories,
    experiences,
    socials,
  ] = await Promise.allSettled([
    listProjects(),
    listArticles(),
    safeFetch(getProfile),
    safeFetch(listAbout),
    safeFetch(listSkills),
    safeFetch(listExperiences),
    safeFetch(listSocials),
  ])

  const projects = projectsResult.status === "fulfilled" && projectsResult.value.ok
    ? projectsResult.value.data as Project[]
    : null
  const projectsOffline = projects === null

  const articles = articlesResult.status === "fulfilled" && articlesResult.value.ok
    ? articlesResult.value.data as Article[]
    : null
  const articlesOffline = articles === null

  const profileData = profile.status === "fulfilled" ? profile.value as Profile | null : null
  const aboutData = aboutItems.status === "fulfilled" ? aboutItems.value as AboutItem[] | null : null
  const skillsData = skillCategories.status === "fulfilled" ? skillCategories.value as SkillCategory[] | null : null
  const experiencesData = experiences.status === "fulfilled" ? experiences.value as Experience[] | null : null
  const socialsData = socials.status === "fulfilled" ? socials.value as Social[] | null : null

  const apiOnline = !projectsOffline && !articlesOffline

  // Fall back to site.ts when API unavailable or not yet seeded
  const tagline = profileData?.tagline ?? site.tagline
  const stack = profileData?.stack.length ? profileData.stack : [...site.stack]
  const aboutParagraphs = aboutData?.length ? aboutData.map((a) => a.content) : [...site.about]

  // Skills: use API data if seeded, otherwise convert site.ts fallback to SkillCategory shape
  const skillCategoryList: SkillCategory[] = skillsData?.length
    ? skillsData
    : site.skills.map((g, i) => ({
      id: -(i + 1), // negative IDs signal static fallback
      name: g.category,
      sort: i,
      skills: g.items.map((name, j) => ({
        id: -(i * 100 + j + 1),
        name,
        category_id: -(i + 1),
        sort: j,
        created_at: "",
        updated_at: "",
      })),
      created_at: "",
      updated_at: "",
    }))

  const experienceList: Experience[] = experiencesData?.length
    ? experiencesData
    : site.experience.map((e, i) => ({
      id: -(i + 1),
      company: e.company,
      role: e.role,
      period: e.period,
      description: "",
      sort_order: i,
      created_at: "",
      updated_at: "",
    }))
  const socialLinks = socialsData?.length
    ? socialsData.map((s) => ({ label: s.platform, href: s.url }))
    : [...site.socials]

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Header />
      <main id="main">
        <Hero apiOnline={apiOnline} tagline={tagline} stack={stack} />
        <WorkSection projects={projects} offline={projectsOffline} />
        <LogsSection articles={articles} offline={articlesOffline} />
        <AboutSection paragraphs={aboutParagraphs} />
        <SkillsSection categories={skillCategoryList} />
        <ExperienceSection experiences={experienceList} />
        <HireMeSection />
      </main>
      <Footer socials={socialLinks} />
      <BackToTop />
    </>
  )
}
