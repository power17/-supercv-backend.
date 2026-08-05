import { contactValues, ModuleContent, modulesOf, profileData, ResumePaper, type TemplateProps } from './shared'

export function AtsTemplate({ resume }: TemplateProps) {
  const { profile, values } = profileData(resume)
  return <ResumePaper resume={resume} className="p-9 font-sans text-black shadow-none"><div className="mb-5 text-center"><h1 className="text-2xl font-bold uppercase">{profile?.name || '你的姓名'}</h1><p className="mt-1 text-sm">{values.jobIntention || '求职意向'}</p><p className="mt-2 text-xs">{contactValues(resume).join(' | ')}</p></div>{modulesOf(resume).map((module) => <section className="mb-5" key={module.key}><h2 className="mb-2 border-b border-black pb-1 text-sm font-bold uppercase">{module.title}</h2><ModuleContent module={module} accent="#000000" /></section>)}</ResumePaper>
}
