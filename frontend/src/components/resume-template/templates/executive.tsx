import { Avatar, contactValues, ModuleContent, modulesOf, profileData, ResumePaper, type TemplateProps } from './shared'

export function ExecutiveTemplate({ resume }: TemplateProps) {
  const { profile, values } = profileData(resume)
  return <ResumePaper resume={resume}><div className="bg-[#2d3436] px-9 py-8 text-white"><div className="flex items-center gap-6"><Avatar resume={resume} className="rounded-md border-2 border-[#00b894]" /><div><h1 className="text-3xl font-bold">{profile?.name || '你的姓名'}</h1><p className="mt-1 text-[#00b894]">{values.jobIntention || '求职意向'}</p><p className="mt-3 text-xs text-zinc-400">{contactValues(resume).join(' · ')}</p></div></div></div><div className="p-8">{modulesOf(resume).map((module) => <section className="mb-6" key={module.key}><h2 className="mb-3 border-b-2 border-[#00b894] pb-1 text-sm font-bold text-[#2d3436]">{module.title}</h2><ModuleContent module={module} accent="#2d3436" /></section>)}</div></ResumePaper>
}
