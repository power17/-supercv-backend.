import { Avatar, contactValues, ModuleContent, modulesOf, profileData, ResumePaper, type TemplateProps } from './shared'

export function MinimalTemplate({ resume }: TemplateProps) {
  const { profile, values } = profileData(resume)
  return <ResumePaper resume={resume} className="p-10"><div className="mb-7 flex items-start justify-between"><div><h1 className="text-3xl font-light tracking-tight text-zinc-900">{profile?.name || '你的姓名'}</h1><p className="mt-1 text-sm text-zinc-500">{values.jobIntention || '求职意向'}</p><p className="mt-3 text-xs text-zinc-400">{contactValues(resume).join(' / ')}</p></div><Avatar resume={resume} className="rounded-sm grayscale" /></div>{modulesOf(resume).map((module) => <section className="mb-6 grid grid-cols-[120px_1fr] gap-5 border-t border-zinc-200 pt-4" key={module.key}><h2 className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">{module.title}</h2><div><ModuleContent module={module} /></div></section>)}</ResumePaper>
}
