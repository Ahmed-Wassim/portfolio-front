import { PageHeader } from "@/components/admin/PageHeader"
import { AboutItemForm } from "@/components/admin/AboutItemForm"

export default function NewAboutItemPage() {
  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="ABOUT" title="NEW PARAGRAPH" />
      <AboutItemForm />
    </div>
  )
}
