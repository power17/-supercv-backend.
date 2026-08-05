import {
  Check,
  ChevronRight,
  GripVertical,
  LayoutTemplate,
  LoaderCircle,
  Palette,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getResume, listTemplates, updateResume } from '../api/resume'
import { useAuth } from '../auth/AuthContext'
import { EditorPreviewPanel } from '../components/editor/EditorPreviewPanel'
import { EditorToolbar } from '../components/editor/EditorToolbar'
import { createEmptyModule, defaultExtraStyle, defaultRawData } from '../lib/demo'
import type { Resume, ResumeModule, ResumeModuleItem } from '../types'

type EditorTab = 'content' | 'style'
type MobileView = 'edit' | 'preview'

const profileFields = [
  ['telephone', '手机'],
  ['email', '邮箱'],
  ['wechat', '微信'],
  ['workYears', '工作年限'],
  ['workPlace', '工作地点'],
  ['jobIntention', '求职意向'],
  ['github', 'GitHub'],
] as const

const colors = ['#2556d8', '#0f766e', '#7c3aed', '#111827', '#c2410c', '#be123c']
const fieldLabelClass = 'flex flex-col gap-1.5 text-[11px] font-semibold text-[#596478]'
const inputClass = 'h-9 w-full rounded-md border border-[#dfe3e9] bg-white px-2.5 text-xs font-normal text-[#354057] outline-none focus:border-[#8da7ff] focus:ring-2 focus:ring-[#315efb12]'

function clone<T>(value: T): T {
  return structuredClone(value)
}

export function EditorPage() {
  const { id } = useParams()
  const { auth } = useAuth()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [tab, setTab] = useState<EditorTab>('content')
  const [mobileView, setMobileView] = useState<MobileView>('edit')
  const [activeSection, setActiveSection] = useState('profile')
  const [zoom, setZoom] = useState(82)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth || !id) return
    setLoading(true)
    Promise.all([
      getResume(auth, Number(id)),
      listTemplates(1, 50).catch(() => ({ count: 0, templates: [] })),
    ])
      .then(([data, templateResult]) => setResume({
        ...data,
        template: data.template ?? templateResult.templates.find((template) => template.id === data.templateId),
        rawData: data.rawData ?? clone(defaultRawData),
        extraStyle: data.extraStyle ?? { ...defaultExtraStyle },
      }))
      .catch(() => setError('简历加载失败'))
      .finally(() => setLoading(false))
  }, [auth, id])

  const activeModule = useMemo(
    () => resume?.rawData?.modules.find((module) => module.key === activeSection),
    [resume, activeSection],
  )

  function mutate(updater: (draft: Resume) => void) {
    setResume((current) => {
      if (!current) return current
      const draft = clone(current)
      updater(draft)
      return draft
    })
    setSaved(false)
  }

  async function handleSave() {
    if (!auth || !resume) return
    setSaving(true)
    setError('')
    try {
      setResume(await updateResume(auth, resume))
      setSaved(true)
    } catch {
      setError('保存失败，请检查网络连接')
    } finally {
      setSaving(false)
    }
  }

  function updateModuleItem(moduleKey: string, index: number, patch: Partial<ResumeModuleItem>) {
    mutate((draft) => {
      const module = draft.rawData?.modules.find((item) => item.key === moduleKey)
      if (module) module.items[index] = { ...module.items[index], ...patch }
    })
  }

  function addModuleItem(moduleKey: string) {
    mutate((draft) => {
      const module = draft.rawData?.modules.find((item) => item.key === moduleKey)
      if (!module) return
      const source = module.items[0]
      module.items.push({
        ...(source ?? createEmptyModule('custom', '自定义').items[0]),
        titleMajor: '',
        titleMinor: '',
        titleOther: '',
        titleDate: '',
        content: '',
      })
    })
  }

  function removeModuleItem(moduleKey: string, index: number) {
    mutate((draft) => {
      const module = draft.rawData?.modules.find((item) => item.key === moduleKey)
      if (module && module.items.length > 1) module.items.splice(index, 1)
    })
  }

  if (loading) {
    return <div className="flex h-[calc(100vh-105px)] items-center justify-center gap-2 bg-[#f5f7fa] text-sm text-[#7d8490]"><LoaderCircle className="animate-spin" /> 正在打开简历编辑器</div>
  }

  if (!resume) {
    return (
      <div className="flex h-[calc(100vh-105px)] flex-col items-center justify-center gap-4 bg-[#f5f7fa] text-sm text-[#7d8490]">
        <p>{error || '简历不存在'}</p>
        <Link className="rounded-md bg-[#3279ed] px-4 py-2 font-semibold text-white" to="/resume">返回我的简历</Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-105px)] min-h-[620px] flex-col overflow-hidden bg-[#edf0f4] max-md:h-[calc(100vh-105px)] max-md:min-h-0">
      <EditorToolbar
        name={resume.name}
        saved={saved}
        saving={saving}
        error={error}
        onNameChange={(name) => mutate((draft) => void (draft.name = name))}
        onSave={handleSave}
        onExport={() => window.print()}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <aside className="z-[4] flex w-[72px] shrink-0 flex-col gap-1 border-r border-[#e1e4e9] bg-white p-2 max-md:w-14">
          <RailButton active={tab === 'content'} icon={<Settings2 size={19} />} label="内容" onClick={() => { setTab('content'); setMobileView('edit') }} />
          <RailButton active={tab === 'style'} icon={<Palette size={19} />} label="样式" onClick={() => { setTab('style'); setMobileView('edit') }} />
          <RailButton icon={<LayoutTemplate size={19} />} label="模板" disabled />
          <RailButton icon={<Sparkles size={19} />} label="优化" disabled />
        </aside>

        <aside className={`${mobileView === 'preview' ? 'max-md:hidden' : ''} z-[3] w-[370px] shrink-0 overflow-y-auto border-r border-[#dfe3e9] bg-white shadow-[5px_0_15px_rgba(39,51,78,0.04)] max-xl:w-[330px] max-md:w-[calc(100%-56px)]`}>
          {tab === 'content' ? (
            <>
              <div className="px-5 pt-5 pb-4">
                <span className="mb-2 inline-flex rounded-full bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#3279ed]">步骤 3 / 4 · 在线编辑</span>
                <h1 className="text-base font-semibold text-[#252a34]">编辑简历内容</h1>
                <p className="mt-1 text-[11px] text-[#99a1af]">选择模块填写信息，右侧将实时生成简历</p>
              </div>
              <SectionNavigation resume={resume} activeSection={activeSection} onSelect={setActiveSection} />
              <div className="px-4 py-5 pb-10">
                {activeSection === 'profile' ? (
                  <ProfileEditor resume={resume} mutate={mutate} />
                ) : activeModule ? (
                  <ModuleEditor
                    module={activeModule}
                    onPatch={(index, patch) => updateModuleItem(activeModule.key, index, patch)}
                    onAdd={() => addModuleItem(activeModule.key)}
                    onRemove={(index) => removeModuleItem(activeModule.key, index)}
                  />
                ) : null}
              </div>
            </>
          ) : <StyleEditor resume={resume} mutate={mutate} />}
        </aside>

        <div className={`${mobileView === 'edit' ? 'max-md:hidden' : ''} min-w-0 flex-1`}>
          <EditorPreviewPanel resume={resume} zoom={zoom} onZoomChange={setZoom} />
        </div>

        <div className="fixed right-4 bottom-4 z-30 hidden overflow-hidden rounded-full border border-[#dce2eb] bg-white p-1 shadow-lg max-md:flex">
          <button className={`rounded-full px-4 py-2 text-xs ${mobileView === 'edit' ? 'bg-[#3279ed] text-white' : 'text-[#647083]'}`} type="button" onClick={() => setMobileView('edit')}>编辑</button>
          <button className={`rounded-full px-4 py-2 text-xs ${mobileView === 'preview' ? 'bg-[#3279ed] text-white' : 'text-[#647083]'}`} type="button" onClick={() => setMobileView('preview')}>预览</button>
        </div>
      </div>
    </div>
  )
}

function RailButton({ icon, label, active = false, disabled = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg border-0 text-[10px] ${active ? 'bg-[#edf2ff] text-[#315be7]' : 'bg-transparent text-[#7b8596] hover:bg-[#f6f7f9]'} disabled:cursor-default disabled:opacity-50`} type="button" disabled={disabled} onClick={onClick}>
      {icon}{label}
    </button>
  )
}

function SectionNavigation({ resume, activeSection, onSelect }: { resume: Resume; activeSection: string; onSelect: (key: string) => void }) {
  const sections = [{ key: 'profile', title: '基本信息' }, ...(resume.rawData?.modules ?? [])]
  return (
    <nav className="border-y border-[#eceef2] px-3 py-3" aria-label="简历模块">
      {sections.map((section) => (
        <button className={`grid h-9 w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border-0 px-2.5 text-left text-xs ${activeSection === section.key ? 'bg-[#f0f4ff] font-semibold text-[#315be7]' : 'bg-transparent text-[#626d80] hover:bg-[#f7f8fa]'}`} type="button" key={section.key} onClick={() => onSelect(section.key)}>
          <GripVertical className="text-[#b1b7c1]" size={15} /> {section.title} <ChevronRight size={15} />
        </button>
      ))}
    </nav>
  )
}

function ProfileEditor({ resume, mutate }: { resume: Resume; mutate: (updater: (draft: Resume) => void) => void }) {
  const profile = resume.rawData?.profile
  if (!profile) return null

  function setProfileField(key: string, value: string) {
    mutate((draft) => {
      const item = draft.rawData?.profile.items.find((field) => field.key === key)
      if (item) item.value = value
      else draft.rawData?.profile.items.push({ key, label: key, value })
    })
  }

  return (
    <div>
      <label className={fieldLabelClass}>姓名<input className={inputClass} value={profile.name ?? ''} onChange={(event) => mutate((draft) => void (draft.rawData!.profile.name = event.target.value))} placeholder="请输入姓名" /></label>
      <div className="mt-3 grid grid-cols-2 gap-3 max-[380px]:grid-cols-1">
        {profileFields.map(([key, label]) => (
          <label className={fieldLabelClass} key={key}>{label}<input className={inputClass} value={profile.items.find((item) => item.key === key)?.value ?? ''} onChange={(event) => setProfileField(key, event.target.value)} placeholder={`请输入${label}`} /></label>
        ))}
      </div>
      <label className="mt-5 flex items-center border-t border-[#eceef2] py-4 text-xs text-[#596478]">
        <span className="flex flex-col"><strong>显示头像</strong><small className="mt-1 font-normal text-[#9ca4b1]">在简历顶部显示个人头像</small></span>
        <input className="ml-auto size-4 accent-[#315efb]" type="checkbox" checked={profile.photoEnabled} onChange={(event) => mutate((draft) => void (draft.rawData!.profile.photoEnabled = event.target.checked))} />
      </label>
    </div>
  )
}

function ModuleEditor({ module, onPatch, onAdd, onRemove }: { module: ResumeModule; onPatch: (index: number, patch: Partial<ResumeModuleItem>) => void; onAdd: () => void; onRemove: (index: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {module.items.map((item, index) => (
        <section className="rounded-lg border border-[#e3e6eb] bg-white p-3" key={`${module.key}-${index}`}>
          <header className="mb-3 flex items-center border-b border-[#eff1f4] pb-2.5 text-[11px] font-bold text-[#4f5a6d]">
            <span className="flex items-center gap-1"><GripVertical size={14} /> {module.title} {module.items.length > 1 ? index + 1 : ''}</span>
            <button className="ml-auto grid place-items-center border-0 bg-transparent text-[#a0a7b2] hover:text-[#d33a48] disabled:opacity-40" type="button" disabled={module.items.length === 1} onClick={() => onRemove(index)} aria-label="删除条目"><Trash2 size={15} /></button>
          </header>
          {item.titleEnabled ? (
            <div className="grid grid-cols-2 gap-3">
              <TextField label={item.titleMajorName} value={item.titleMajor} onChange={(value) => onPatch(index, { titleMajor: value })} />
              <TextField label={item.titleMinorName} value={item.titleMinor} onChange={(value) => onPatch(index, { titleMinor: value })} />
              <TextField label={item.titleOtherName} value={item.titleOther} onChange={(value) => onPatch(index, { titleOther: value })} />
              <TextField label={item.titleDateName} value={item.titleDate} onChange={(value) => onPatch(index, { titleDate: value })} />
            </div>
          ) : null}
          <label className={`${fieldLabelClass} mt-3`}>内容描述<textarea className="min-h-28 w-full resize-y rounded-md border border-[#dfe3e9] bg-white p-2.5 text-xs font-normal leading-6 text-[#354057] outline-none focus:border-[#8da7ff] focus:ring-2 focus:ring-[#315efb12]" value={item.content ?? ''} placeholder={item.contentHint} onChange={(event) => onPatch(index, { content: event.target.value })} /></label>
        </section>
      ))}
      <button className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-dashed border-[#b8c7f7] bg-[#f8faff] text-xs font-semibold text-[#315be7] hover:bg-[#f1f5ff]" type="button" onClick={onAdd}><Plus size={16} /> 添加一段{module.title}</button>
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <label className={fieldLabelClass}>{label}<input className={inputClass} value={value ?? ''} onChange={(event) => onChange(event.target.value)} /></label>
}

function StyleEditor({ resume, mutate }: { resume: Resume; mutate: (updater: (draft: Resume) => void) => void }) {
  const style = resume.extraStyle ?? defaultExtraStyle
  function patch(key: keyof typeof style, value: string | number) {
    mutate((draft) => { draft.extraStyle = { ...(draft.extraStyle ?? defaultExtraStyle), [key]: value } })
  }
  return (
    <div className="px-5 py-5">
      <span className="mb-2 inline-flex rounded-full bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#3279ed]">步骤 3 / 4 · 在线编辑</span>
      <h1 className="text-base font-semibold text-[#252a34]">简历样式</h1>
      <p className="mt-1 text-[11px] text-[#99a1af]">调整后可在右侧实时预览效果</p>
      <StyleSection title="主题颜色">
        <div className="flex flex-wrap gap-2.5">{colors.map((color) => <button className={`grid size-8 place-items-center rounded-full border-[3px] border-white text-white ${style.themeColor === color ? 'outline outline-1 outline-[#aab3c2]' : ''}`} style={{ background: color }} type="button" key={color} onClick={() => patch('themeColor', color)} aria-label={`选择颜色 ${color}`}>{style.themeColor === color ? <Check size={14} /> : null}</button>)}</div>
      </StyleSection>
      <StyleSection title="字体"><select className={inputClass} value={style.fontFamily} onChange={(event) => patch('fontFamily', event.target.value)}><option value="">系统默认字体</option><option value={'"Inter", "PingFang SC", sans-serif'}>现代无衬线</option><option value={'"Noto Serif SC", serif'}>经典衬线</option></select></StyleSection>
      <RangeField label="正文字号" value={style.contentFontSize} min={12} max={18} unit="px" onChange={(value) => patch('contentFontSize', value)} />
      <RangeField label="正文行高" value={style.contentLineHeight} min={1.2} max={2.2} step={0.1} onChange={(value) => patch('contentLineHeight', value)} />
      <RangeField label="模块间距" value={style.moduleMargin} min={8} max={32} unit="px" onChange={(value) => patch('moduleMargin', value)} />
      <RangeField label="页面边距" value={style.pageMarginHorizontal} min={20} max={60} unit="px" onChange={(value) => patch('pageMarginHorizontal', value)} />
    </div>
  )
}

function StyleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-b border-[#eceef2] py-4"><h2 className="mb-3 text-xs font-semibold text-[#4d586b]">{title}</h2>{children}</section>
}

function RangeField({ label, value, min, max, step = 1, unit = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void }) {
  return (
    <section className="border-b border-[#eceef2] py-4">
      <div className="mb-2 flex items-center text-xs text-[#4d586b]"><label>{label}</label><span className="ml-auto text-[11px] text-[#8992a1]">{value}{unit}</span></div>
      <input className="w-full accent-[#315efb]" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </section>
  )
}
