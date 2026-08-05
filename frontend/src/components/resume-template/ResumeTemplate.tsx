import type { ComponentType } from 'react'
import type { Resume, Template } from '../../types'
import { AcademicTemplate } from './templates/academic'
import { AtsTemplate } from './templates/ats'
import { ClassicTemplate } from './templates/classic'
import { CreativeTemplate } from './templates/creative'
import { ElegantTemplate } from './templates/elegant'
import { ExecutiveTemplate } from './templates/executive'
import { MinimalTemplate } from './templates/minimal'
import { ModernTemplate } from './templates/modern'
import { ProfessionalTemplate } from './templates/professional'
import { TwoColumnTemplate } from './templates/two-column'
import type { TemplateProps } from './templates/shared'

export const SUPPORTED_PAGE_FRAMES = [
  'classic', 'modern', 'minimal', 'professional', 'two-column',
  'creative', 'ats', 'academic', 'elegant', 'executive',
] as const

type PageFrame = (typeof SUPPORTED_PAGE_FRAMES)[number]

const templateRegistry: Record<PageFrame, ComponentType<TemplateProps>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  professional: ProfessionalTemplate,
  'two-column': TwoColumnTemplate,
  creative: CreativeTemplate,
  ats: AtsTemplate,
  academic: AcademicTemplate,
  elegant: ElegantTemplate,
  executive: ExecutiveTemplate,
}

function frameOf(resume: Resume): PageFrame {
  const frame = resume.template?.pageFrame
  return SUPPORTED_PAGE_FRAMES.includes(frame as PageFrame) ? (frame as PageFrame) : 'classic'
}

export function ResumeTemplate({ resume }: TemplateProps) {
  const TemplateComponent = templateRegistry[frameOf(resume)]
  return <TemplateComponent resume={resume} />
}

export function TemplateResumePreview({ resume, template, scale }: { resume: Resume; template: Template; scale: number }) {
  const previewResume = { ...resume, templateId: template.id, template }
  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-100">
      <div className="absolute top-0 left-1/2 w-[794px] origin-top" style={{ transform: `translateX(-50%) scale(${scale})` }}>
        <ResumeTemplate resume={previewResume} />
      </div>
    </div>
  )
}
