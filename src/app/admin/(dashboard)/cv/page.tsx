"use client"

import { CVCard } from "@/components/admin/CVCard"
import { PageHeader } from "@/components/admin/PageHeader"

export default function AdminCVPage() {
  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="ADMIN" title="CV" />
      <CVCard variant="page" />
    </div>
  )
}
