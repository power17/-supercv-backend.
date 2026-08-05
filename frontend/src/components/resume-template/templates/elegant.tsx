import { Avatar, contactValues, ModuleContent, modulesOf, profileData, ResumePaper, type TemplateProps } from './shared'

export function ElegantTemplate({ resume }: TemplateProps) {
  const { profile, values } = profileData(resume)
  return <ResumePaper resume={resume} className="p-10 font-serif"><div className="mb-7 flex items-center gap-5 border-b border-[#c5a059] pb-5"><Avatar resume={resume} className="rounded-full border border-[#c5a059]" /><div><h1 className="text-3xl text-[#2c2c2c]">{profile?.name || '你的姓名'}</h1><p className="text-sm italic text-[#9b7b3e]">{values.jobIntention || '求职意向'}</p><p className="mt-2 text-xs text-zinc-500">{contactValues(resume).join(' · ')}</p></div></div>{modulesOf(resume).map((module) => <section className="mb-5" key={module.key}><h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#9b7b3e] after:h-px after:flex-1 after:bg-[#d8c49b]">{module.title}</h2><ModuleContent module={module} accent="#9b7b3e" /></section>)}</ResumePaper>
}
