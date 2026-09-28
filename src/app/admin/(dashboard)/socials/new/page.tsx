import { SocialForm } from "@/components/admin/SocialForm"
import { PageHeader } from "@/components/admin/PageHeader"

export default function NewSocialPage() {
  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="SOCIALS" title="NEW SOCIAL" />
      <SocialForm />
    </div>
  )
}
