import { ArticleForm } from "@/components/admin/ArticleForm"
import { PageHeader } from "@/components/admin/PageHeader"

export default function NewArticlePage() {
  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="ARTICLES" title="NEW ARTICLE" />
      <ArticleForm />
    </div>
  )
}
