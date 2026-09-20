import { ExperienceForm } from "@/components/admin/ExperienceForm"

export default function NewExperiencePage() {
  return (
    <div className="p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">EXPERIENCE</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">NEW ENTRY</h1>
      </div>
      <ExperienceForm />
    </div>
  )
}
