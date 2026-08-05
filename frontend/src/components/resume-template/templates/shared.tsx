import type { CSSProperties, ReactNode } from 'react'
import type { Resume, ResumeModule, ResumeModuleItem } from '../../../types'

export type TemplateProps = { resume: Resume }

export function profileData(resume: Resume) {
  const profile = resume.rawData?.profile
  return { profile, values: Object.fromEntries((profile?.items ?? []).map((item) => [item.key, item.value ?? ''])) }
}

export function contactValues(resume: Resume) {
  const { values } = profileData(resume)
  return [values.telephone, values.email, values.workPlace, values.workYears, values.github].filter(Boolean)
}

export function modulesOf(resume: Resume) {
  return (resume.rawData?.modules ?? []).filter((module) => module.enabled)
}

function paperStyle(resume: Resume): CSSProperties {
  const style = resume.extraStyle
  return {
    '--resume-theme': style?.themeColor ?? '#2556d8',
    '--resume-pad-x': `${style?.pageMarginHorizontal ?? 36}px`,
    '--resume-pad-y': `${style?.pageMarginVertical ?? 34}px`,
    '--resume-section-gap': `${style?.moduleMargin ?? 18}px`,
    '--resume-font-size': `${style?.contentFontSize ?? 14}px`,
    '--resume-line-height': style?.contentLineHeight ?? 1.7,
    fontFamily: style?.fontFamily || undefined,
  } as CSSProperties
}

export function ResumePaper({ resume, children, className = '' }: TemplateProps & { children: ReactNode; className?: string }) {
  return <article className={`resume-paper overflow-hidden bg-white ${className}`} style={paperStyle(resume)}>{children}</article>
}

export function Avatar({ resume, className = '' }: TemplateProps & { className?: string }) {
  const profile = resume.rawData?.profile
  if (!profile?.photoEnabled || !profile.photoUrl) return null
  return <img className={`size-20 shrink-0 object-cover ${className}`} src={profile.photoUrl} alt="" />
}

function Entry({ item, accent = '#334155' }: { item: ResumeModuleItem; accent?: string }) {
  return (
    <div className="mb-2.5 last:mb-0">
      {item.titleEnabled && <div className="mb-1 flex items-baseline gap-2 text-xs"><strong style={{ color: accent }}>{item.titleMajor || item.titleMajorName}</strong>{item.titleMinor && <span className="text-zinc-600">{item.titleMinor}</span>}{item.titleOther && <span className="text-zinc-500">{item.titleOther}</span>}{item.titleDate && <time className="ml-auto shrink-0 text-[11px] text-zinc-400">{item.titleDate}</time>}</div>}
      {item.content && <p className="whitespace-pre-line text-[length:var(--resume-font-size)] leading-[var(--resume-line-height)] text-zinc-600">{item.content}</p>}
    </div>
  )
}

export function ModuleContent({ module, accent }: { module: ResumeModule; accent?: string }) {
  return <>{module.items.map((item, index) => <Entry item={item} accent={accent} key={`${module.key}-${index}`} />)}</>
}
