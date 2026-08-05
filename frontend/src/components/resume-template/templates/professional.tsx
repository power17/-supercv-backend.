import { Avatar, contactValues, ModuleContent, modulesOf, profileData, ResumePaper, type TemplateProps } from './shared'

export function ProfessionalTemplate({ resume }: TemplateProps) {
  const { profile, values } = profileData(resume)
  return <ResumePaper resume={resume} className="p-10 font-serif"><div className="mb-6 text-center"><Avatar resume={resume} className="mx-auto mb-3 rounded-full border-2 border-[#1e3a5f]" /><h1 className="text-3xl font-bold text-[#1e3a5f]">{profile?.name || '你的姓名'}</h1><p className="text-sm text-zinc-500">{values.jobIntention || '求职意向'}</p><div className="mx-auto my-3 h-px w-3/4 bg-[linear-gradient(90deg,transparent,#1e3a5f,transparent)]" /><p className="text-xs text-zinc-500">{contactValues(resume).join(' · ')}</p></div>{modulesOf(resume).map((module) => <section className="mb-5" key={module.key}><h2 className="mb-3 flex items-center gap-3 text-sm font-bold text-[#1e3a5f] after:h-px after:flex-1 after:bg-zinc-300">{module.title}</h2><ModuleContent module={module} accent="#1e3a5f" /></section>)}</ResumePaper>
}
