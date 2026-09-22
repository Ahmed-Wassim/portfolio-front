import { ArticleForm } from "@/components/admin/ArticleForm"

export default function NewArticlePage() {
  return (
    <div className="p-4 sm:p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ARTICLES</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">NEW ARTICLE</h1>
      </div>
      <ArticleForm />
    </div>
  )
}
