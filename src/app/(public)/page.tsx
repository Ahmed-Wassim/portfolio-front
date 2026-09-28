import { Hero } from "@/components/public/Hero"
import { WorkSection } from "@/components/public/WorkSection"
import { LogsSection } from "@/components/public/LogsSection"
import { AboutSection } from "@/components/public/AboutSection"
import { SkillsSection } from "@/components/public/SkillsSection"
import { ExperienceSection } from "@/components/public/ExperienceSection"
import { HireMeSection } from "@/components/public/HireMeSection"
import {
  listProjects,
  listArticles,
  getProfile,
  listAbout,
  listSkills,
  listExperiences,
} from "@/lib/api"
import { site } from "@/config/site"
import type { SkillCategory, Experience } from "@/types/api"

/**
 * Public content is revalidated on an interval rather than forced dynamic:
 * with `force-dynamic` every visitor triggered a fresh set of seven API calls.
 * A short window keeps admin edits visible within a minute at a fraction of the
 * request volume.
 */
export const revalidate = 60

export default async function Home() {
  // All fetches independent — one failure never blanks the whole poster.
  // request() never throws (network errors become failed ApiResults),
  // so Promise.all is safe here without allSettled.
  const [projectsRes, articlesRes, profileRes, aboutRes, skillsRes, experiencesRes] =
    await Promise.all([
      listProjects({ revalidate: 60 }),
      listArticles({ revalidate: 60 }),
      getProfile({ revalidate: 60 }),
      listAbout({ revalidate: 60 }),
      listSkills({ revalidate: 60 }),
      listExperiences({ revalidate: 60 }),
    ])

  const projects = projectsRes.ok ? projectsRes.data : null
  const projectsOffline = projects === null

  const articles = articlesRes.ok ? articlesRes.data : null
  const articlesOffline = articles === null

  const profileData = profileRes.ok ? profileRes.data : null
  const aboutData = aboutRes.ok ? aboutRes.data : null
  const skillsData = skillsRes.ok ? skillsRes.data : null
  const experiencesData = experiencesRes.ok ? experiencesRes.data : null

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

  return (
    <main id="main">
      <Hero apiOnline={apiOnline} tagline={tagline} stack={stack} />
      <WorkSection projects={projects} offline={projectsOffline} />
      <LogsSection articles={articles} offline={articlesOffline} />
      <AboutSection paragraphs={aboutParagraphs} />
      <SkillsSection categories={skillCategoryList} />
      <ExperienceSection experiences={experienceList} />
      <HireMeSection />
    </main>
  )
}
