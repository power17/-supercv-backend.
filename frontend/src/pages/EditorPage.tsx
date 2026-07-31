import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  GripVertical,
  LayoutTemplate,
  LoaderCircle,
  Minus,
  Palette,
  Plus,
  Redo2,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  Undo2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getResume, updateResume } from '../api/resume'
import { useAuth } from '../auth/AuthContext'
import { Brand } from '../components/Brand'
import { ResumePreview } from '../components/ResumePreview'
import { createEmptyModule, defaultExtraStyle, defaultRawData } from '../lib/demo'
import type { Resume, ResumeModule, ResumeModuleItem } from '../types'

type EditorTab = 'content' | 'style'

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
  const [activeSection, setActiveSection] = useState('profile')
  const [zoom, setZoom] = useState(82)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth || !id) return
    getResume(auth, Number(id))
      .then((data) =>
        setResume({
          ...data,
          rawData: data.rawData ?? clone(defaultRawData),
          extraStyle: data.extraStyle ?? { ...defaultExtraStyle },
        }),
      )
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
      const next = await updateResume(auth, resume)
      setResume(next)
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
    return (
      <div className="editor-loading">
        <LoaderCircle className="spin" />
        正在打开简历编辑器
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="editor-loading">
        <p>{error || '简历不存在'}</p>
        <Link className="button button-primary" to="/resume">
          返回我的简历
        </Link>
      </div>
    )
  }

  return (
    <div className="editor-page">
      <header className="editor-topbar">
        <div className="editor-topbar-left">
          <Link className="editor-back" to="/resume" aria-label="返回简历列表">
            <ArrowLeft size={19} />
          </Link>
          <Brand compact />
          <span className="topbar-divider" />
          <input
            className="resume-name-input"
            value={resume.name}
            onChange={(event) => mutate((draft) => void (draft.name = event.target.value))}
            aria-label="简历名称"
          />
          <span className={`save-state ${saved ? 'saved' : ''}`}>
            {saved ? <Check size={14} /> : null}
            {saved ? '已保存' : '有未保存修改'}
          </span>
        </div>
        <div className="editor-topbar-center">
          <button type="button" title="撤销" disabled>
            <Undo2 size={18} />
          </button>
          <button type="button" title="重做" disabled>
            <Redo2 size={18} />
          </button>
        </div>
        <div className="editor-topbar-actions">
          {error && <span className="editor-error">{error}</span>}
          <button className="button button-ghost button-small" type="button" onClick={handleSave}>
            {saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}
            保存
          </button>
          <button className="button button-primary button-small" type="button" onClick={() => window.print()}>
            <Download size={17} /> 导出 PDF
          </button>
        </div>
      </header>

      <div className="editor-workspace">
        <aside className="editor-rail">
          <button
            className={tab === 'content' ? 'active' : ''}
            type="button"
            onClick={() => setTab('content')}
          >
            <Settings2 size={20} /> 内容
          </button>
          <button
            className={tab === 'style' ? 'active' : ''}
            type="button"
            onClick={() => setTab('style')}
          >
            <Palette size={20} /> 样式
          </button>
          <button type="button" disabled>
            <LayoutTemplate size={20} /> 模板
          </button>
          <button type="button" disabled>
            <Sparkles size={20} /> 优化
          </button>
        </aside>

        <aside className="editor-panel">
          {tab === 'content' ? (
            <>
              <div className="editor-panel-heading">
                <h2>编辑内容</h2>
                <p>点击模块编辑简历信息</p>
              </div>
              <div className="section-nav">
                <button
                  className={activeSection === 'profile' ? 'active' : ''}
                  type="button"
                  onClick={() => setActiveSection('profile')}
                >
                  <GripVertical size={16} /> 基本信息 <ChevronDown size={16} />
                </button>
                {resume.rawData?.modules.map((module) => (
                  <button
                    className={activeSection === module.key ? 'active' : ''}
                    type="button"
                    key={module.key}
                    onClick={() => setActiveSection(module.key)}
                  >
                    <GripVertical size={16} /> {module.title} <ChevronDown size={16} />
                  </button>
                ))}
              </div>
              <div className="section-editor">
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
          ) : (
            <StyleEditor resume={resume} mutate={mutate} />
          )}
        </aside>

        <main className="editor-canvas">
          <div className="canvas-toolbar">
            <span>A4 · 单页预览</span>
            <div className="zoom-control">
              <button type="button" onClick={() => setZoom((value) => Math.max(55, value - 5))}>
                <Minus size={15} />
              </button>
              <span>{zoom}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(110, value + 5))}>
                <Plus size={15} />
              </button>
            </div>
          </div>
          <div className="paper-stage">
            <div className="paper-scaler" style={{ transform: `scale(${zoom / 100})` }}>
              <ResumePreview resume={resume} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ProfileEditor({
  resume,
  mutate,
}: {
  resume: Resume
  mutate: (updater: (draft: Resume) => void) => void
}) {
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
    <div className="editor-form">
      <label>
        姓名
        <input
          value={profile.name ?? ''}
          onChange={(event) =>
            mutate((draft) => void (draft.rawData!.profile.name = event.target.value))
          }
          placeholder="请输入姓名"
        />
      </label>
      <div className="form-grid">
        {profileFields.map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={profile.items.find((item) => item.key === key)?.value ?? ''}
              onChange={(event) => setProfileField(key, event.target.value)}
              placeholder={`请输入${label}`}
            />
          </label>
        ))}
      </div>
      <label className="toggle-row">
        <span>
          <strong>显示头像</strong>
          <small>在简历顶部显示个人头像</small>
        </span>
        <input
          type="checkbox"
          checked={profile.photoEnabled}
          onChange={(event) =>
            mutate((draft) => void (draft.rawData!.profile.photoEnabled = event.target.checked))
          }
        />
      </label>
    </div>
  )
}

function ModuleEditor({
  module,
  onPatch,
  onAdd,
  onRemove,
}: {
  module: ResumeModule
  onPatch: (index: number, patch: Partial<ResumeModuleItem>) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="module-editor">
      {module.items.map((item, index) => (
        <section className="module-item-card" key={`${module.key}-${index}`}>
          <header>
            <span>
              <GripVertical size={15} /> {module.title} {module.items.length > 1 ? index + 1 : ''}
            </span>
            <button
              type="button"
              disabled={module.items.length === 1}
              onClick={() => onRemove(index)}
              aria-label="删除条目"
            >
              <Trash2 size={15} />
            </button>
          </header>
          {item.titleEnabled && (
            <div className="form-grid">
              <label>
                {item.titleMajorName}
                <input
                  value={item.titleMajor ?? ''}
                  onChange={(event) => onPatch(index, { titleMajor: event.target.value })}
                />
              </label>
              <label>
                {item.titleMinorName}
                <input
                  value={item.titleMinor ?? ''}
                  onChange={(event) => onPatch(index, { titleMinor: event.target.value })}
                />
              </label>
              <label>
                {item.titleOtherName}
                <input
                  value={item.titleOther ?? ''}
                  onChange={(event) => onPatch(index, { titleOther: event.target.value })}
                />
              </label>
              <label>
                {item.titleDateName}
                <input
                  value={item.titleDate ?? ''}
                  onChange={(event) => onPatch(index, { titleDate: event.target.value })}
                />
              </label>
            </div>
          )}
          <label>
            内容描述
            <textarea
              rows={6}
              value={item.content ?? ''}
              placeholder={item.contentHint}
              onChange={(event) => onPatch(index, { content: event.target.value })}
            />
          </label>
        </section>
      ))}
      <button className="add-item-button" type="button" onClick={onAdd}>
        <Plus size={17} /> 添加一段{module.title}
      </button>
    </div>
  )
}

function StyleEditor({
  resume,
  mutate,
}: {
  resume: Resume
  mutate: (updater: (draft: Resume) => void) => void
}) {
  const style = resume.extraStyle ?? defaultExtraStyle

  function patch(key: keyof typeof style, value: string | number) {
    mutate((draft) => {
      draft.extraStyle = { ...(draft.extraStyle ?? defaultExtraStyle), [key]: value }
    })
  }

  return (
    <>
      <div className="editor-panel-heading">
        <h2>样式设置</h2>
        <p>调整简历整体视觉风格</p>
      </div>
      <div className="style-editor">
        <section>
          <h3>主题颜色</h3>
          <div className="color-grid">
            {colors.map((color) => (
              <button
                className={style.themeColor === color ? 'active' : ''}
                style={{ background: color }}
                type="button"
                key={color}
                onClick={() => patch('themeColor', color)}
                aria-label={`选择颜色 ${color}`}
              >
                {style.themeColor === color && <Check size={15} />}
              </button>
            ))}
          </div>
        </section>
        <section>
          <label>
            字体
            <select value={style.fontFamily} onChange={(event) => patch('fontFamily', event.target.value)}>
              <option value="">系统默认字体</option>
              <option value='"Inter", "PingFang SC", sans-serif'>现代无衬线</option>
              <option value='"Noto Serif SC", serif'>经典衬线</option>
            </select>
          </label>
        </section>
        <RangeField
          label="正文字号"
          value={style.contentFontSize}
          min={12}
          max={18}
          unit="px"
          onChange={(value) => patch('contentFontSize', value)}
        />
        <RangeField
          label="正文行高"
          value={style.contentLineHeight}
          min={1.2}
          max={2.2}
          step={0.1}
          onChange={(value) => patch('contentLineHeight', value)}
        />
        <RangeField
          label="模块间距"
          value={style.moduleMargin}
          min={8}
          max={32}
          unit="px"
          onChange={(value) => patch('moduleMargin', value)}
        />
        <RangeField
          label="页面边距"
          value={style.pageMarginHorizontal}
          min={20}
          max={60}
          unit="px"
          onChange={(value) => patch('pageMarginHorizontal', value)}
        />
      </div>
    </>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <section className="range-field">
      <div>
        <label>{label}</label>
        <span>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </section>
  )
}

