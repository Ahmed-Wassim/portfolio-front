import { ProjectForm } from "@/components/admin/ProjectForm"

export default function NewProjectPage() {
  return (
    <div className="p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">PROJECTS</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">NEW PROJECT</h1>
      </div>
      <ProjectForm />
    </div>
  )
}
