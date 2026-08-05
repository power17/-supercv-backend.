import { Avatar, contactValues, ModuleContent, modulesOf, profileData, ResumePaper, type TemplateProps } from './shared'

export function ClassicTemplate({ resume }: TemplateProps) {
  const { profile, values } = profileData(resume)
  return <ResumePaper resume={resume} className="p-9"><div className="mb-6 flex items-center justify-center gap-5 border-b-2 border-zinc-800 pb-4 text-center"><Avatar resume={resume} className="rounded-full" /><div><h1 className="text-2xl font-bold text-zinc-900">{profile?.name || '你的姓名'}</h1><p className="mt-1 text-base text-zinc-600">{values.jobIntention || '求职意向'}</p></div></div><p className="mb-5 text-center text-xs text-zinc-500">{contactValues(resume).join(' · ')}</p>{modulesOf(resume).map((module) => <section className="mb-5" key={module.key}><h2 className="mb-2 border-b border-zinc-300 pb-1 text-sm font-bold tracking-wider text-zinc-800">{module.title}</h2><ModuleContent module={module} /></section>)}</ResumePaper>
}
