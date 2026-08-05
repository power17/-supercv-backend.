import { contactValues, ModuleContent, modulesOf, profileData, ResumePaper, type TemplateProps } from './shared'

export function AcademicTemplate({ resume }: TemplateProps) {
  const { profile, values } = profileData(resume)
  return <ResumePaper resume={resume} className="p-10 font-serif"><div className="mb-5 text-center"><h1 className="text-2xl font-bold text-zinc-900">{profile?.name || '你的姓名'}</h1><p className="text-sm italic text-zinc-600">{values.jobIntention || '求职意向'}</p><p className="mt-1 text-xs text-zinc-500">{contactValues(resume).join(' · ')}</p></div>{modulesOf(resume).map((module) => <section className="mb-4" key={module.key}><h2 className="mb-2 text-[13px] font-bold tracking-wide text-zinc-800 uppercase">{module.title}</h2><ModuleContent module={module} accent="#27272a" /></section>)}</ResumePaper>
}
