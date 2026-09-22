import {
  AtSign,
  Briefcase,
  Camera,
  CodeXml,
  Globe,
  Mail,
  Phone,
  Send,
  Share2,
  type LucideIcon,
} from "lucide-react"

/**
 * Static platform → icon map for socials.
 * Matches against the `icon` field first, then falls back to `platform`.
 * lucide-react ships no brand icons, so generic icons are used.
 */
export function getSocialIcon(platform?: string | null, icon?: string | null): LucideIcon {
  const keys = [icon, platform]
    .filter((s): s is string => !!s)
    .map((s) => s.toLowerCase().trim())

  for (const key of keys) {
    if (/github|gitlab|gitea|code|dev/.test(key)) return CodeXml
    if (/linkedin|resume|\bcv\b/.test(key)) return Briefcase
    if (/twitter|tweet|^x$/.test(key)) return AtSign
    if (/face ?book|\bfb\b/.test(key)) return Share2
    if (/insta|gram|photo/.test(key)) return Camera
    if (/tele(gram)?/.test(key)) return Send
    if (/mail|gmail|email|contact/.test(key)) return Mail
    if (/phone|tel|call|whatsapp|number|mobile/.test(key)) return Phone
  }
  return Globe
}
