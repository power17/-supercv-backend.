import { Mail, MapPin, Phone } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Resume } from '../types'

function splitContent(content = '') {
  return content
    .split(/\n|；|;/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function ResumePreview({
  resume,
  miniature = false,
}: {
  resume: Resume
  miniature?: boolean
}) {
  const rawData = resume.rawData
  const profile = rawData?.profile
  const style = resume.extraStyle
  const items = Object.fromEntries(
    (profile?.items ?? []).map((item) => [item.key, item.value ?? '']),
  )

  return (
    <article
      className={`resume-paper ${miniature ? 'resume-paper-miniature' : ''}`}
      style={
        {
          '--resume-theme': style?.themeColor ?? '#2556d8',
          '--resume-pad-x': `${style?.pageMarginHorizontal ?? 36}px`,
          '--resume-pad-y': `${style?.pageMarginVertical ?? 34}px`,
          '--resume-section-gap': `${style?.moduleMargin ?? 18}px`,
          '--resume-font-size': `${style?.contentFontSize ?? 14}px`,
          '--resume-line-height': style?.contentLineHeight ?? 1.7,
          fontFamily: style?.fontFamily || undefined,
        } as CSSProperties
      }
    >
      <div className="resume-heading">
        <div>
          <h1>{profile?.name || '你的姓名'}</h1>
          <p>{items.jobIntention || '求职意向'}</p>
        </div>
        {profile?.photoEnabled && profile.photoUrl && (
          <img className="resume-avatar" src={profile.photoUrl} alt="" />
        )}
      </div>
      <div className="resume-contact">
        {items.telephone && (
          <span>
            <Phone size={12} />
            {items.telephone}
          </span>
        )}
        {items.email && (
          <span>
            <Mail size={12} />
            {items.email}
          </span>
        )}
        {items.workPlace && (
          <span>
            <MapPin size={12} />
            {items.workPlace}
          </span>
        )}
        {items.workYears && <span>{items.workYears}工作经验</span>}
        {items.github && <span>{items.github}</span>}
      </div>

      {(rawData?.modules ?? [])
        .filter((module) => module.enabled)
        .map((module) => (
          <section className="resume-section" key={module.key}>
            <h2>{module.title}</h2>
            <div className="resume-section-rule" />
            {module.items.map((item, index) => (
              <div className="resume-entry" key={`${module.key}-${index}`}>
                {item.titleEnabled && (
                  <div className="resume-entry-title">
                    <strong>{item.titleMajor || item.titleMajorName}</strong>
                    <span>{item.titleMinor}</span>
                    <span>{item.titleOther}</span>
                    <time>{item.titleDate}</time>
                  </div>
                )}
                {item.content &&
                  (splitContent(item.content).length > 1 ? (
                    <ul>
                      {splitContent(item.content).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{item.content}</p>
                  ))}
              </div>
            ))}
          </section>
        ))}
    </article>
  )
}
