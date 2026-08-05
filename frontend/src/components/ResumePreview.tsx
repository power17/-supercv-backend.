import { ResumeTemplate } from './resume-template/ResumeTemplate'
import type { Resume } from '../types'

export function ResumePreview({
  resume,
  miniature = false,
}: {
  resume: Resume
  miniature?: boolean
}) {
  return (
    <div className={miniature ? 'resume-paper-miniature' : ''}>
      <ResumeTemplate resume={resume} />
    </div>
  )
}
