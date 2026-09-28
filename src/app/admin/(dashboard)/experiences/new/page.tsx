import { ExperienceForm } from "@/components/admin/ExperienceForm"
import { PageHeader } from "@/components/admin/PageHeader"

export default function NewExperiencePage() {
  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="EXPERIENCE" title="NEW ENTRY" />
      <ExperienceForm />
    </div>
  )
}
