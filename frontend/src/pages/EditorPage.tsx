import { Modal } from 'antd'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  LayoutTemplate,
  LoaderCircle,
  Palette,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getResume, listTemplates, optimizeResumeContent } from '../api/resume'
import { useAuth } from '../auth/AuthContext'
import { EditorPreviewPanel } from '../components/editor/EditorPreviewPanel'
import { EditorToolbar } from '../components/editor/EditorToolbar'
import { TemplateResumePreview } from '../components/resume-template/ResumeTemplate'
import { useResumeEditor } from '../hooks/useResumeEditor'
import { createEmptyModule, defaultExtraStyle, defaultRawData } from '../lib/demo'
import type { Resume, ResumeModule, ResumeModuleItem, Template } from '../types'

type EditorTab = 'content' | 'style' | 'template' | 'optimize'
type MobileView = 'edit' | 'preview'

const profileFields = [
  ['telephone', '手机'], ['email', '邮箱'], ['wechat', '微信'],
  ['workYears', '工作年限'], ['workPlace', '工作地点'],
  ['jobIntention', '求职意向'], ['github', 'GitHub'],
] as const

const colors = ['#2556d8', '#0f766e', '#7c3aed', '#111827', '#c2410c', '#be123c']
const stylePresets = [
  { name: '经典蓝', color: '#2556d8', font: '"Inter", "PingFang SC", sans-serif', size: 14, line: 1.7 },
  { name: '商务黑', color: '#111827', font: '"Noto Serif SC", serif', size: 14, line: 1.65 },
  { name: '清新绿', color: '#0f766e', font: '"Inter", "PingFang SC", sans-serif', size: 13, line: 1.75 },
]
const fieldLabelClass = 'flex flex-col gap-1.5 text-[11px] font-semibold text-[#596478]'
const inputClass = 'h-9 w-full rounded-md border border-[#dfe3e9] bg-white px-2.5 text-xs font-normal text-[#354057] outline-none focus:border-[#8da7ff] focus:ring-2 focus:ring-[#315efb12]'

function clone<T>(value: T): T { return structuredClone(value) }

function resumeDiagnosticText(resume: Resume) {
  const profile = resume.rawData?.profile
  const profileLines = [
    profile?.name ? `姓名：${profile.name}` : '',
    ...(profile?.items ?? []).filter((item) => item.value?.trim()).map((item) => `${item.label}：${item.value}`),
  ].filter(Boolean)
  const moduleLines = (resume.rawData?.modules ?? [])
    .filter((module) => module.enabled)
    .flatMap((module) => [
      `\n【${module.title}】`,
      ...module.items.flatMap((item) => [
        [item.titleMajor, item.titleMinor, item.titleOther, item.titleDate].filter(Boolean).join(' | '),
        item.content?.trim() ?? '',
      ].filter(Boolean)),
    ])
  return [...profileLines, ...moduleLines].join('\n').trim()
}

export function EditorPage() {
  const { id } = useParams()
  const { auth } = useAuth()
  const [initialResume, setInitialResume] = useState<Resume | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [tab, setTab] = useState<EditorTab>('content')
  const [mobileView, setMobileView] = useState<MobileView>('edit')
  const [activeSection, setActiveSection] = useState('profile')
  const [zoom, setZoom] = useState(82)
  const [optimizingKey, setOptimizingKey] = useState('')
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosisOpen, setDiagnosisOpen] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState('')
  const editor = useResumeEditor(auth, initialResume)
  const { resume, mutate } = editor

  useEffect(() => {
    if (!auth || !id) return
    let active = true
    setLoading(true)
    setLoadError('')
    Promise.all([
      getResume(auth, Number(id)),
      listTemplates(1, 50).catch(() => ({ count: 0, templates: [] })),
    ])
      .then(([data, templateResult]) => {
        if (!active) return
        setTemplates(templateResult.templates ?? [])
        setInitialResume({
          ...data,
          template: data.template ?? templateResult.templates.find((template) => template.id === data.templateId),
          rawData: data.rawData ?? clone(defaultRawData),
          extraStyle: data.extraStyle ?? { ...defaultExtraStyle },
        })
      })
      .catch(() => active && setLoadError('简历加载失败'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [auth, id])

  const activeModule = useMemo(
    () => resume?.rawData?.modules.find((module) => module.key === activeSection),
    [resume, activeSection],
  )

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
        titleMajor: '', titleMinor: '', titleOther: '', titleDate: '', content: '',
      })
    })
  }

  function removeModuleItem(moduleKey: string, index: number) {
    mutate((draft) => {
      const module = draft.rawData?.modules.find((item) => item.key === moduleKey)
      if (module && module.items.length > 1) module.items.splice(index, 1)
    })
  }

  function moveModuleItem(moduleKey: string, index: number, direction: -1 | 1) {
    mutate((draft) => {
      const module = draft.rawData?.modules.find((item) => item.key === moduleKey)
      if (!module) return
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= module.items.length) return
      const [item] = module.items.splice(index, 1)
      module.items.splice(nextIndex, 0, item)
    })
  }

  function addModule(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const key = `custom-${Date.now()}`
    mutate((draft) => { draft.rawData?.modules.push(createEmptyModule(key, trimmed)) })
    setActiveSection(key)
  }

  function removeModule(key: string) {
    mutate((draft) => {
      const modules = draft.rawData?.modules
      if (!modules) return
      const module = modules.find((item) => item.key === key)
      if (!module || module.defaultModule) return
      draft.rawData!.modules = modules.filter((item) => item.key !== key)
    })
    setActiveSection('profile')
  }

  function moveModule(key: string, direction: -1 | 1) {
    mutate((draft) => {
      const modules = draft.rawData?.modules
      if (!modules) return
      const index = modules.findIndex((item) => item.key === key)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= modules.length) return
      const [item] = modules.splice(index, 1)
      modules.splice(nextIndex, 0, item)
    })
  }

  function toggleModule(key: string) {
    mutate((draft) => {
      const module = draft.rawData?.modules.find((item) => item.key === key)
      if (module) module.enabled = !module.enabled
    })
  }

  async function optimizeItem(module: ResumeModule, index: number) {
    const item = module.items[index]
    const content = item?.content?.trim()
    if (!auth || !content) {
      setActionError('请先填写内容，再使用 AI 优化')
      return
    }
    const key = `${module.key}-${index}`
    setOptimizingKey(key)
    setActionError('')
    try {
      const optimized = await optimizeResumeContent(auth, module.title, content)
      updateModuleItem(module.key, index, { content: optimized })
    } catch {
      setActionError('AI 优化失败，请检查优化次数或稍后重试')
    } finally {
      setOptimizingKey('')
    }
  }

  async function diagnoseResume() {
    if (!auth || !resume || diagnosing) return
    const content = resumeDiagnosticText(resume)
    if (!content) {
      setActionError('请先填写简历内容，再进行 AI 诊断')
      return
    }
    setDiagnosing(true)
    setActionError('')
    try {
      await editor.save()
      const result = await optimizeResumeContent(
        auth,
        '整份简历诊断。请从信息完整度、专业表达、成果量化、内容清晰度和岗位匹配度五个方面分项诊断，指出问题并给出可执行的修改建议，不要直接重写全文',
        content,
      )
      setDiagnosisResult(result)
      setDiagnosisOpen(true)
    } catch {
      setActionError('AI 诊断失败，请检查 AI 优化剩余次数或稍后重试')
    } finally {
      setDiagnosing(false)
    }
  }

  if (loading) return <EditorLoading label="正在打开简历编辑器" />
  if (!resume) {
    return (
      <div className="flex h-[calc(100vh-105px)] flex-col items-center justify-center gap-4 bg-[#f5f7fa] text-sm text-[#7d8490]">
        <p>{loadError || '简历不存在'}</p>
        <Link className="rounded-md bg-[#3279ed] px-4 py-2 font-semibold text-white" to="/user/resume">返回我的简历</Link>
      </div>
    )
  }

  const error = loadError || editor.saveError || actionError
  return (
    <div className="flex h-[calc(100vh-105px)] min-h-[620px] flex-col overflow-hidden bg-[#edf0f4] print:h-auto print:min-h-0 print:overflow-visible">
      <EditorToolbar
        name={resume.name}
        saved={editor.saved}
        saving={editor.saving}
        error={error}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onNameChange={(name) => mutate((draft) => { draft.name = name })}
        onSave={editor.save}
        onDiagnose={diagnoseResume}
        diagnosing={diagnosing}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onExport={async () => { await editor.save(); window.print() }}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden print:block print:overflow-visible">
        <aside className="z-[4] flex w-[72px] shrink-0 flex-col gap-1 border-r border-[#e1e4e9] bg-white p-2 max-md:w-14 print:hidden">
          <RailButton active={tab === 'content'} icon={<Settings2 size={19} />} label="内容" onClick={() => { setTab('content'); setMobileView('edit') }} />
          <RailButton active={tab === 'style'} icon={<Palette size={19} />} label="样式" onClick={() => { setTab('style'); setMobileView('edit') }} />
          <RailButton active={tab === 'template'} icon={<LayoutTemplate size={19} />} label="模板" onClick={() => { setTab('template'); setMobileView('edit') }} />
          <RailButton active={tab === 'optimize'} icon={<Sparkles size={19} />} label="优化" onClick={() => { setTab('optimize'); setMobileView('edit') }} />
        </aside>

        <aside className={`${mobileView === 'preview' ? 'max-md:hidden' : ''} z-[3] w-[390px] shrink-0 overflow-y-auto border-r border-[#dfe3e9] bg-white shadow-[5px_0_15px_rgba(39,51,78,0.04)] max-xl:w-[340px] max-md:w-[calc(100%-56px)] print:hidden`}>
          {error ? <div className="m-3 rounded-md border border-[#f0d1d4] bg-[#fff7f7] px-3 py-2 text-xs text-[#bb4851]">{error}</div> : null}
          {tab === 'content' ? (
            <ContentPanel
              resume={resume}
              activeSection={activeSection}
              activeModule={activeModule}
              optimizingKey={optimizingKey}
              mutate={mutate}
              onSelect={setActiveSection}
              onAddModule={addModule}
              onRemoveModule={removeModule}
              onMoveModule={moveModule}
              onToggleModule={toggleModule}
              onPatchItem={(index, patch) => activeModule && updateModuleItem(activeModule.key, index, patch)}
              onAddItem={() => activeModule && addModuleItem(activeModule.key)}
              onRemoveItem={(index) => activeModule && removeModuleItem(activeModule.key, index)}
              onMoveItem={(index, direction) => activeModule && moveModuleItem(activeModule.key, index, direction)}
              onOptimizeItem={(index) => activeModule && optimizeItem(activeModule, index)}
            />
          ) : tab === 'style' ? (
            <StyleEditor resume={resume} mutate={mutate} />
          ) : tab === 'template' ? (
            <TemplateEditor resume={resume} templates={templates} mutate={mutate} />
          ) : (
            <OptimizePanel resume={resume} optimizingKey={optimizingKey} onSelectModule={(key) => { setActiveSection(key); setTab('content') }} onOptimize={optimizeItem} />
          )}
        </aside>

        <div className={`${mobileView === 'edit' ? 'max-md:hidden' : ''} min-w-0 flex-1 print:block`}>
          <EditorPreviewPanel resume={resume} zoom={zoom} onZoomChange={setZoom} />
        </div>

        <div className="fixed right-4 bottom-4 z-30 hidden overflow-hidden rounded-full border border-[#dce2eb] bg-white p-1 shadow-lg max-md:flex print:hidden">
          <button className={`rounded-full px-4 py-2 text-xs ${mobileView === 'edit' ? 'bg-[#3279ed] text-white' : 'text-[#647083]'}`} type="button" onClick={() => setMobileView('edit')}>编辑</button>
          <button className={`rounded-full px-4 py-2 text-xs ${mobileView === 'preview' ? 'bg-[#3279ed] text-white' : 'text-[#647083]'}`} type="button" onClick={() => setMobileView('preview')}>预览</button>
        </div>
      </div>

      <Modal
        title={<span className="flex items-center gap-2 text-[#343b49]"><Sparkles size={18} className="text-[#6554d9]" /> AI 简历诊断报告</span>}
        open={diagnosisOpen}
        width={720}
        centered
        onCancel={() => setDiagnosisOpen(false)}
        footer={<button className="h-9 rounded-md border-0 bg-[#3279ed] px-5 text-sm font-semibold text-white" type="button" onClick={() => setDiagnosisOpen(false)}>我知道了</button>}
      >
        <div className="max-h-[60vh] overflow-y-auto rounded-lg bg-[#f7f8fb] p-4 text-sm leading-7 whitespace-pre-wrap text-[#4d5666]">
          {diagnosisResult}
        </div>
      </Modal>
    </div>
  )
}

function EditorLoading({ label }: { label: string }) {
  return <div className="flex h-[calc(100vh-105px)] items-center justify-center gap-2 bg-[#f5f7fa] text-sm text-[#7d8490]"><LoaderCircle className="animate-spin" /> {label}</div>
}

function RailButton({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return <button className={`flex h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-0 text-[10px] ${active ? 'bg-[#edf2ff] text-[#315be7]' : 'bg-transparent text-[#7b8596] hover:bg-[#f6f7f9]'}`} type="button" onClick={onClick}>{icon}{label}</button>
}

type ContentPanelProps = {
  resume: Resume; activeSection: string; activeModule?: ResumeModule; optimizingKey: string
  mutate: (updater: (draft: Resume) => void) => void; onSelect: (key: string) => void
  onAddModule: (title: string) => void; onRemoveModule: (key: string) => void
  onMoveModule: (key: string, direction: -1 | 1) => void; onToggleModule: (key: string) => void
  onPatchItem: (index: number, patch: Partial<ResumeModuleItem>) => void
  onAddItem: () => void; onRemoveItem: (index: number) => void
  onMoveItem: (index: number, direction: -1 | 1) => void; onOptimizeItem: (index: number) => void
}

function ContentPanel(props: ContentPanelProps) {
  return (
    <>
      <PanelHeading title="编辑简历内容" description="选择模块填写信息，右侧将实时生成简历" />
      <SectionNavigation {...props} />
      <div className="px-4 py-5 pb-10">
        {props.activeSection === 'profile' ? <ProfileEditor resume={props.resume} mutate={props.mutate} /> : props.activeModule ? (
          <ModuleEditor
            module={props.activeModule}
            optimizingKey={props.optimizingKey}
            onRename={(title) => props.mutate((draft) => { const module = draft.rawData?.modules.find((item) => item.key === props.activeModule!.key); if (module) module.title = title })}
            onPatch={props.onPatchItem} onAdd={props.onAddItem} onRemove={props.onRemoveItem} onMove={props.onMoveItem} onOptimize={props.onOptimizeItem}
          />
        ) : null}
      </div>
    </>
  )
}

function PanelHeading({ title, description }: { title: string; description: string }) {
  return <div className="px-5 pt-5 pb-4"><span className="mb-2 inline-flex rounded-full bg-[#edf3ff] px-2 py-1 text-[10px] font-semibold text-[#3279ed]">步骤 3 / 4 · 在线编辑</span><h1 className="text-base font-semibold text-[#252a34]">{title}</h1><p className="mt-1 text-[11px] text-[#99a1af]">{description}</p></div>
}

function SectionNavigation({ resume, activeSection, onSelect, onAddModule, onRemoveModule, onMoveModule, onToggleModule }: ContentPanelProps) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const modules = resume.rawData?.modules ?? []
  return (
    <nav className="border-y border-[#eceef2] px-3 py-3" aria-label="简历模块">
      <button className={`grid h-9 w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border-0 px-2.5 text-left text-xs ${activeSection === 'profile' ? 'bg-[#f0f4ff] font-semibold text-[#315be7]' : 'bg-transparent text-[#626d80] hover:bg-[#f7f8fa]'}`} type="button" onClick={() => onSelect('profile')}><GripVertical className="text-[#b1b7c1]" size={15} /> 基本信息 <ChevronRight size={15} /></button>
      {modules.map((module, index) => (
        <div className={`group/section mt-0.5 flex items-center rounded-md ${activeSection === module.key ? 'bg-[#f0f4ff]' : 'hover:bg-[#f7f8fa]'}`} key={module.key}>
          <button className={`grid h-9 min-w-0 flex-1 grid-cols-[auto_1fr] items-center gap-2 border-0 bg-transparent px-2.5 text-left text-xs ${activeSection === module.key ? 'font-semibold text-[#315be7]' : 'text-[#626d80]'}`} type="button" onClick={() => onSelect(module.key)}><GripVertical className="text-[#b1b7c1]" size={15} /><span className={`truncate ${module.enabled ? '' : 'line-through opacity-50'}`}>{module.title}</span></button>
          <div className="mr-1 hidden items-center group-hover/section:flex max-md:flex">
            <SmallIconButton label="上移" disabled={index === 0} onClick={() => onMoveModule(module.key, -1)}><ArrowUp size={12} /></SmallIconButton>
            <SmallIconButton label="下移" disabled={index === modules.length - 1} onClick={() => onMoveModule(module.key, 1)}><ArrowDown size={12} /></SmallIconButton>
            <SmallIconButton label={module.enabled ? '隐藏' : '显示'} onClick={() => onToggleModule(module.key)}>{module.enabled ? <Eye size={12} /> : <EyeOff size={12} />}</SmallIconButton>
            {!module.defaultModule ? <SmallIconButton label="删除" danger onClick={() => onRemoveModule(module.key)}><Trash2 size={12} /></SmallIconButton> : null}
          </div>
        </div>
      ))}
      {adding ? (
        <form className="mt-2 flex gap-1.5" onSubmit={(event) => { event.preventDefault(); onAddModule(title); setTitle(''); setAdding(false) }}>
          <input className={`${inputClass} min-w-0 flex-1`} autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="模块名称" />
          <button className="rounded-md border-0 bg-[#3279ed] px-3 text-xs text-white" type="submit">添加</button>
        </form>
      ) : <button className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#bdc9dd] bg-white text-xs text-[#5276b5] hover:bg-[#f6f9ff]" type="button" onClick={() => setAdding(true)}><Plus size={14} /> 添加自定义模块</button>}
    </nav>
  )
}

function SmallIconButton({ children, label, disabled = false, danger = false, onClick }: { children: React.ReactNode; label: string; disabled?: boolean; danger?: boolean; onClick: () => void }) {
  return <button className={`grid size-6 place-items-center rounded border-0 bg-transparent ${danger ? 'text-[#c7515a] hover:bg-[#fff0f0]' : 'text-[#8a93a2] hover:bg-white'} disabled:opacity-30`} type="button" title={label} disabled={disabled} onClick={onClick}>{children}</button>
}

function ProfileEditor({ resume, mutate }: { resume: Resume; mutate: (updater: (draft: Resume) => void) => void }) {
  const profile = resume.rawData?.profile
  if (!profile) return null
  function setField(key: string, value: string) { mutate((draft) => { const item = draft.rawData?.profile.items.find((field) => field.key === key); if (item) item.value = value; else draft.rawData?.profile.items.push({ key, label: key, value }) }) }
  return (
    <div>
      <label className={fieldLabelClass}>姓名<input className={inputClass} value={profile.name ?? ''} onChange={(event) => mutate((draft) => { draft.rawData!.profile.name = event.target.value })} placeholder="请输入姓名" /></label>
      <div className="mt-3 grid grid-cols-2 gap-3 max-[380px]:grid-cols-1">{profileFields.map(([key, label]) => <label className={fieldLabelClass} key={key}>{label}<input className={inputClass} value={profile.items.find((item) => item.key === key)?.value ?? ''} onChange={(event) => setField(key, event.target.value)} placeholder={`请输入${label}`} /></label>)}</div>
      <label className="mt-5 flex items-center border-t border-[#eceef2] py-4 text-xs text-[#596478]"><span className="flex flex-col"><strong>显示头像</strong><small className="mt-1 font-normal text-[#9ca4b1]">在简历顶部显示个人头像</small></span><input className="ml-auto size-4 accent-[#315efb]" type="checkbox" checked={profile.photoEnabled} onChange={(event) => mutate((draft) => { draft.rawData!.profile.photoEnabled = event.target.checked })} /></label>
      {profile.photoEnabled ? <label className={fieldLabelClass}>头像地址<input className={inputClass} value={profile.photoUrl ?? ''} onChange={(event) => mutate((draft) => { draft.rawData!.profile.photoUrl = event.target.value })} placeholder="请输入头像图片 URL" /></label> : null}
    </div>
  )
}

function ModuleEditor({ module, optimizingKey, onRename, onPatch, onAdd, onRemove, onMove, onOptimize }: { module: ResumeModule; optimizingKey: string; onRename: (title: string) => void; onPatch: (index: number, patch: Partial<ResumeModuleItem>) => void; onAdd: () => void; onRemove: (index: number) => void; onMove: (index: number, direction: -1 | 1) => void; onOptimize: (index: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <label className={fieldLabelClass}>模块名称<input className={inputClass} value={module.title} onChange={(event) => onRename(event.target.value)} /></label>
      {module.items.map((item, index) => {
        const optimizing = optimizingKey === `${module.key}-${index}`
        return <section className="rounded-lg border border-[#e3e6eb] bg-white p-3" key={`${module.key}-${index}`}>
          <header className="mb-3 flex items-center border-b border-[#eff1f4] pb-2.5 text-[11px] font-bold text-[#4f5a6d]"><span className="flex items-center gap-1"><GripVertical size={14} /> {module.title} {module.items.length > 1 ? index + 1 : ''}</span><span className="ml-auto flex items-center"><SmallIconButton label="上移" disabled={index === 0} onClick={() => onMove(index, -1)}><ArrowUp size={13} /></SmallIconButton><SmallIconButton label="下移" disabled={index === module.items.length - 1} onClick={() => onMove(index, 1)}><ArrowDown size={13} /></SmallIconButton><button className="ml-1 grid place-items-center border-0 bg-transparent text-[#a0a7b2] hover:text-[#d33a48] disabled:opacity-40" type="button" disabled={module.items.length === 1} onClick={() => onRemove(index)} aria-label="删除条目"><Trash2 size={15} /></button></span></header>
          {item.titleEnabled ? <div className="grid grid-cols-2 gap-3"><TextField label={item.titleMajorName} value={item.titleMajor} onChange={(value) => onPatch(index, { titleMajor: value })} /><TextField label={item.titleMinorName} value={item.titleMinor} onChange={(value) => onPatch(index, { titleMinor: value })} /><TextField label={item.titleOtherName} value={item.titleOther} onChange={(value) => onPatch(index, { titleOther: value })} /><TextField label={item.titleDateName} value={item.titleDate} onChange={(value) => onPatch(index, { titleDate: value })} /></div> : null}
          <label className={`${fieldLabelClass} mt-3`}><span className="flex items-center">内容描述<button className="ml-auto flex items-center gap-1 border-0 bg-transparent text-[10px] font-semibold text-[#6c5ce7] disabled:opacity-50" type="button" disabled={optimizing || !item.content?.trim()} onClick={() => onOptimize(index)}>{optimizing ? <LoaderCircle className="animate-spin" size={12} /> : <Sparkles size={12} />} AI 优化</button></span><textarea className="min-h-28 w-full resize-y rounded-md border border-[#dfe3e9] bg-white p-2.5 text-xs font-normal leading-6 text-[#354057] outline-none focus:border-[#8da7ff] focus:ring-2 focus:ring-[#315efb12]" value={item.content ?? ''} placeholder={item.contentHint} onChange={(event) => onPatch(index, { content: event.target.value })} /></label>
        </section>
      })}
      <button className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-dashed border-[#b8c7f7] bg-[#f8faff] text-xs font-semibold text-[#315be7] hover:bg-[#f1f5ff]" type="button" onClick={onAdd}><Plus size={16} /> 添加一段{module.title}</button>
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) { return <label className={fieldLabelClass}>{label}<input className={inputClass} value={value ?? ''} onChange={(event) => onChange(event.target.value)} /></label> }

function StyleEditor({ resume, mutate }: { resume: Resume; mutate: (updater: (draft: Resume) => void) => void }) {
  const style = resume.extraStyle ?? defaultExtraStyle
  function patch(key: keyof typeof style, value: string | number) { mutate((draft) => { draft.extraStyle = { ...(draft.extraStyle ?? defaultExtraStyle), [key]: value } }) }
  function reset() { mutate((draft) => { draft.extraStyle = { ...defaultExtraStyle } }) }
  return (
    <div className="px-5 pb-8"><PanelHeading title="简历样式" description="调整后可在右侧实时预览效果" />
      <StyleSection title="预设主题"><div className="grid grid-cols-3 gap-2">{stylePresets.map((preset) => <button className="rounded-lg border border-[#e1e5eb] bg-white p-2 text-left hover:border-[#91b2ef]" type="button" key={preset.name} onClick={() => mutate((draft) => { draft.extraStyle = { ...(draft.extraStyle ?? defaultExtraStyle), themeColor: preset.color, fontFamily: preset.font, contentFontSize: preset.size, contentLineHeight: preset.line } })}><span className="mb-2 block h-5 rounded" style={{ background: preset.color }} /><small className="text-[10px] text-[#596478]">{preset.name}</small></button>)}</div></StyleSection>
      <StyleSection title="主题颜色"><div className="flex flex-wrap items-center gap-2.5">{colors.map((color) => <button className={`grid size-8 place-items-center rounded-full border-[3px] border-white text-white ${style.themeColor === color ? 'outline outline-1 outline-[#aab3c2]' : ''}`} style={{ background: color }} type="button" key={color} onClick={() => patch('themeColor', color)}>{style.themeColor === color ? <Check size={14} /> : null}</button>)}<input className="size-8 cursor-pointer rounded border-0 p-0" type="color" value={style.themeColor} onChange={(event) => patch('themeColor', event.target.value)} /></div></StyleSection>
      <StyleSection title="字体"><select className={inputClass} value={style.fontFamily} onChange={(event) => patch('fontFamily', event.target.value)}><option value="">系统默认字体</option><option value={'"Inter", "PingFang SC", sans-serif'}>现代无衬线</option><option value={'"Noto Serif SC", serif'}>经典衬线</option><option value={'Georgia, serif'}>Georgia</option></select></StyleSection>
      <RangeField label="正文字号" value={style.contentFontSize} min={12} max={18} unit="px" onChange={(value) => patch('contentFontSize', value)} /><RangeField label="正文行高" value={style.contentLineHeight} min={1.2} max={2.2} step={0.1} onChange={(value) => patch('contentLineHeight', value)} /><RangeField label="模块间距" value={style.moduleMargin} min={8} max={32} unit="px" onChange={(value) => patch('moduleMargin', value)} /><RangeField label="水平边距" value={style.pageMarginHorizontal} min={20} max={60} unit="px" onChange={(value) => patch('pageMarginHorizontal', value)} /><RangeField label="垂直边距" value={style.pageMarginVertical} min={20} max={60} unit="px" onChange={(value) => patch('pageMarginVertical', value)} />
      <button className="mt-5 flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-[#dfe4ec] bg-white text-xs text-[#657084] hover:bg-[#f7f8fa]" type="button" onClick={reset}><RotateCcw size={14} /> 恢复默认样式</button>
    </div>
  )
}

function TemplateEditor({ resume, templates, mutate }: { resume: Resume; templates: Template[]; mutate: (updater: (draft: Resume) => void) => void }) {
  return <div className="px-5 pb-8"><PanelHeading title="切换模板" description="更换模板不会丢失已填写的内容" />{templates.length === 0 ? <div className="rounded-lg border border-dashed border-[#ccd5e3] px-4 py-10 text-center text-xs text-[#929aa7]">暂无可切换的公开模板</div> : <div className="space-y-3">{templates.map((template) => { const selected = resume.templateId === template.id; return <button className={`flex w-full items-center gap-3 rounded-lg border bg-white p-2 text-left ${selected ? 'border-[#3279ed] ring-2 ring-[#3279ed18]' : 'border-[#e1e5eb] hover:border-[#a7bee5]'}`} type="button" key={template.id} onClick={() => mutate((draft) => { draft.templateId = template.id; draft.template = template })}><span className="block h-[145px] w-[108px] shrink-0 overflow-hidden rounded bg-[#eef1f5]"><TemplateResumePreview resume={resume} template={template} scale={0.135} /></span><span className="min-w-0"><strong className="block truncate text-sm text-[#303744]">{template.name}</strong><small className="mt-1 block text-[10px] text-[#929aa7]">{template.pageFrame}</small>{selected ? <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#edf3ff] px-2 py-1 text-[10px] text-[#2876ed]"><Check size={11} /> 当前模板</span> : null}</span></button> })}</div>}</div>
}

function OptimizePanel({ resume, optimizingKey, onSelectModule, onOptimize }: { resume: Resume; optimizingKey: string; onSelectModule: (key: string) => void; onOptimize: (module: ResumeModule, index: number) => void }) {
  const modules = resume.rawData?.modules ?? []
  return <div className="px-5 pb-8"><PanelHeading title="AI 简历优化" description="逐段优化表达，使经历更专业、具体" /><div className="space-y-3">{modules.flatMap((module) => module.items.map((item, index) => { const key = `${module.key}-${index}`; return <article className="rounded-lg border border-[#e2e6ed] bg-white p-3" key={key}><button className="text-xs font-semibold text-[#374154]" type="button" onClick={() => onSelectModule(module.key)}>{module.title}{module.items.length > 1 ? ` ${index + 1}` : ''}</button><p className="mt-2 line-clamp-3 whitespace-pre-line text-[11px] leading-5 text-[#858e9d]">{item.content || '尚未填写内容'}</p><button className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-[#d9d3fb] bg-[#f8f7ff] text-xs font-semibold text-[#6655d8] disabled:opacity-50" type="button" disabled={!item.content?.trim() || optimizingKey === key} onClick={() => onOptimize(module, index)}>{optimizingKey === key ? <LoaderCircle className="animate-spin" size={14} /> : <Sparkles size={14} />} AI 优化这段内容</button></article> }))}</div></div>
}

function StyleSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="border-b border-[#eceef2] py-4"><h2 className="mb-3 text-xs font-semibold text-[#4d586b]">{title}</h2>{children}</section> }
function RangeField({ label, value, min, max, step = 1, unit = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void }) { return <section className="border-b border-[#eceef2] py-4"><div className="mb-2 flex items-center text-xs text-[#4d586b]"><label>{label}</label><span className="ml-auto text-[11px] text-[#8992a1]">{value}{unit}</span></div><input className="w-full accent-[#315efb]" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></section> }
