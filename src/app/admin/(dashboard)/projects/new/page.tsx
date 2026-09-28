import { ProjectForm } from "@/components/admin/ProjectForm"
import { PageHeader } from "@/components/admin/PageHeader"

export default function NewProjectPage() {
  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="PROJECTS" title="NEW PROJECT" />
      <ProjectForm />
    </div>
  )
}
