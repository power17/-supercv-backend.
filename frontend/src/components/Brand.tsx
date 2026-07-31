import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark">
        <Sparkles size={compact ? 18 : 21} strokeWidth={2.5} />
      </span>
      <span>超能简历</span>
    </Link>
  )
}

