import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createResume, listTemplates, updateResume } from '../api/resume'
import { useAuth } from '../auth/AuthContext'
import { TemplateResumePreview } from '../components/resume-template/ResumeTemplate'
import { createTemplateDemoResume } from '../components/resume-template/demoResume'
import { createEmptyRawData } from '../lib/demo'
import type { Template } from '../types'

const PAGE_SIZE = 12

const steps = [
  { title: '选择模版', description: '从下面选择模版，在简历编辑页面可重选模版' },
  { title: '导入简历', description: '导入已有 PDF 简历文件或创建空白简历' },
  { title: '在线编辑', description: '在线编辑调整简历样式和内容并调用 AI 优化' },
  { title: '下载简历', description: '将编辑和 AI 优化之后的简历以 PDF 格式下载' },
]

export function ResumeCreatePage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [creatingMode, setCreatingMode] = useState<'blank' | 'content' | null>(null)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [preview, setPreview] = useState<Template | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    listTemplates(page, PAGE_SIZE)
      .then((data) => {
        if (!active) return
        setTemplates(data.templates ?? [])
        setCount(data.count ?? 0)
      })
      .catch(() => active && setError('模版加载失败，请确认后端服务已启动后重试'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [page, reloadKey])

  function useTemplate(template: Template) {
    setSelectedTemplate(template)
    setPreview(null)
    setCurrentStep(2)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function createSelectedResume(withTemplateContent: boolean) {
    if (!auth || !selectedTemplate) return
    setCreatingMode(withTemplateContent ? 'content' : 'blank')
    setError('')
    try {
      const resume = await createResume(auth, '我的专业简历', selectedTemplate.id, selectedTemplate)
      const demo = createTemplateDemoResume()
      const editableResume = await updateResume(auth, {
        ...resume,
        rawData: withTemplateContent
          ? structuredClone(demo.rawData)
          : createEmptyRawData(),
        extraStyle: resume.extraStyle ?? demo.extraStyle,
      })
      navigate(`/resume/${editableResume.id}/edit`)
    } catch {
      setError('创建简历失败，请稍后重试')
      setCreatingMode(null)
    }
  }

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const sampleResume = useMemo(createTemplateDemoResume, [])

  return (
    <div className="min-h-[calc(100vh-105px)] bg-white text-[#24272e]">
      <main className="mx-auto w-[min(1280px,calc(100%-40px))] py-[68px] pb-20 max-sm:w-[calc(100%-28px)] max-sm:pt-[38px]">
        <section className="mx-auto mb-[50px] grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-lg:gap-y-[22px] max-sm:mb-8 max-sm:grid-cols-1" aria-label="简历优化步骤">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const active = stepNumber === currentStep
            const completed = stepNumber < currentStep
            return (
              <div
                className={`relative flex min-h-[82px] gap-3 pr-6 max-sm:min-h-0 max-sm:after:hidden [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:top-4 [&:not(:last-child)]:after:right-0 [&:not(:last-child)]:after:h-px [&:not(:last-child)]:after:w-[38%] ${completed ? '[&:not(:last-child)]:after:bg-[#287df0]' : '[&:not(:last-child)]:after:bg-[#ebedf0]'} ${active || completed ? 'text-[#34373d]' : 'text-[#a2a5aa]'}`}
                key={step.title}
              >
                <div className={`grid size-8 shrink-0 place-items-center rounded-full text-sm ${active ? 'bg-[#287df0] text-white' : completed ? 'bg-[#e7f2ff] text-[#287df0]' : 'bg-[#f3f4f5] text-[#8a8e95]'}`}>
                  {completed ? <Check size={16} /> : stepNumber}
                </div>
                <div>
                  <h2 className="mt-1 mb-[7px] text-[15px] font-medium">{step.title}</h2>
                  <p className="m-0 max-w-[185px] text-xs leading-[1.65]">{step.description}</p>
                </div>
              </div>
            )
          })}
        </section>

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-[7px] border border-[#f1d3d5] bg-[#fff7f7] px-[15px] py-3 text-[13px] text-[#b84951]">
            <span>{error}</span>
            <button className="cursor-pointer border-0 bg-transparent text-[#2b72e5]" type="button" onClick={() => setReloadKey((value) => value + 1)}>重新加载</button>
          </div>
        )}

        {currentStep === 2 && selectedTemplate ? (
          <section className="mx-auto max-w-[960px]">
            <div className="grid grid-cols-3 gap-[30px] max-md:grid-cols-1">
              <button
                className="flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-[#e4e9f0] bg-white transition hover:-translate-y-1 hover:border-[#9fc0f8] hover:shadow-[0_12px_30px_rgba(43,93,170,0.1)] disabled:cursor-wait"
                type="button"
                disabled={creatingMode !== null}
                onClick={() => createSelectedResume(false)}
              >
                {creatingMode === 'blank' ? <LoaderCircle className="spin mb-3" size={22} /> : null}
                <strong className="text-xl text-[#171a20]">创建空白简历</strong>
                <span className="mt-3 text-[15px] text-[#a1a5ac]">仅包含模板样式、内容为空</span>
              </button>
              <button
                className="flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-[#e4e9f0] bg-white transition hover:-translate-y-1 hover:border-[#9fc0f8] hover:shadow-[0_12px_30px_rgba(43,93,170,0.1)] disabled:cursor-wait"
                type="button"
                disabled={creatingMode !== null}
                onClick={() => createSelectedResume(true)}
              >
                {creatingMode === 'content' ? <LoaderCircle className="spin mb-3" size={22} /> : null}
                <strong className="text-xl text-[#171a20]">创建简历</strong>
                <span className="mt-3 text-[15px] text-[#a1a5ac]">包含模板样式和模板内容</span>
              </button>
              <label className="flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-[#e4e9f0] bg-white transition hover:-translate-y-1 hover:border-[#9fc0f8] hover:shadow-[0_12px_30px_rgba(43,93,170,0.1)]">
                <strong className="text-xl text-[#171a20]">上传已有简历文件</strong>
                <span className="mt-3 text-[15px] text-[#a1a5ac]">支持 PDF 格式的简历文件</span>
                <input
                  className="hidden"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={() => setError('PDF 上传需要先配置 OSS 文件上传服务')}
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="cursor-pointer border-0 bg-transparent text-[15px] text-[#2876ed]" type="button" onClick={() => { setCurrentStep(1); setSelectedTemplate(null); setCreatingMode(null); setError('') }}>
                返回上一步
              </button>
            </div>
          </section>
        ) : loading ? (
          <div className="flex min-h-[420px] items-center justify-center gap-[9px] text-[#7d8490]"><LoaderCircle className="spin" /> 正在加载简历模版</div>
        ) : templates.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center text-[#7d8490]">暂时没有可用的公开模版</div>
        ) : (
          <section className="grid grid-cols-4 gap-x-6 gap-y-7 max-lg:grid-cols-3 max-md:grid-cols-2 max-md:gap-x-3 max-md:gap-y-4 max-[460px]:grid-cols-1" aria-label="简历模版列表">
            {templates.map((template) => (
              <article className="group overflow-hidden rounded-[10px] border border-[#e5e9f0] bg-white p-[14px] transition hover:-translate-y-0.5 hover:border-[#cad9f4] hover:shadow-[0_10px_28px_rgba(38,70,120,0.09)] max-md:p-[9px]" key={template.id}>
                <button className="group/image relative flex h-[375px] w-full cursor-zoom-in items-start justify-center overflow-hidden border-0 bg-[#f7f8fa] p-0 max-md:h-[245px] max-[460px]:h-[420px]" type="button" onClick={() => setPreview(template)}>
                  <TemplateResumePreview resume={sampleResume} template={template} scale={0.32} />
                  <span className="absolute inset-0 flex items-center justify-center gap-[7px] bg-[rgba(24,34,51,0.37)] text-[13px] font-semibold text-white opacity-0 transition-opacity group-hover/image:opacity-100"><Eye size={17} /> 查看大图</span>
                </button>
                <h3 className="mt-4 mb-3 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold text-[#202329]">{template.name}</h3>
                <div className="grid grid-cols-2 overflow-hidden rounded-md border border-[#e7eaf0]">
                  <button className="flex h-[31px] cursor-pointer items-center justify-center gap-[5px] border-0 border-r border-[#e7eaf0] bg-[#f9fafb] text-xs font-semibold text-[#2674eb] hover:bg-[#f1f6ff]" type="button" onClick={() => useTemplate(template)}>
                    使用
                  </button>
                  <button className="h-[31px] cursor-pointer border-0 bg-[#f9fafb] text-xs text-[#4f5662] hover:bg-[#f1f6ff]" type="button" onClick={() => setPreview(template)}>预览</button>
                </div>
              </article>
            ))}
          </section>
        )}

        {currentStep === 1 && !loading && count > PAGE_SIZE && (
          <nav className="mt-[42px] flex items-center justify-center gap-[18px]" aria-label="模版分页">
            <button className="flex h-[34px] cursor-pointer items-center gap-1 rounded-md border border-[#dfe4ec] bg-white px-[13px] text-[#4f5868] disabled:cursor-not-allowed disabled:text-[#b4b8bf]" type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft size={17} /> 上一页
            </button>
            <span className="text-[13px] text-[#777e89]">{page} / {pages}</span>
            <button className="flex h-[34px] cursor-pointer items-center gap-1 rounded-md border border-[#dfe4ec] bg-white px-[13px] text-[#4f5868] disabled:cursor-not-allowed disabled:text-[#b4b8bf]" type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>
              下一页 <ChevronRight size={17} />
            </button>
          </nav>
        )}
      </main>

      {preview && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(20,27,39,0.62)] p-6" role="presentation" onMouseDown={() => setPreview(null)}>
          <div className="flex max-h-[calc(100vh-48px)] w-[min(620px,100%)] flex-col overflow-hidden rounded-xl bg-white shadow-[0_24px_70px_rgba(10,19,35,0.3)]" role="dialog" aria-modal="true" aria-label={`${preview.name}预览`} onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-[#e9ebef] px-[18px] py-4">
              <strong>{preview.name}</strong>
              <button className="grid size-8 cursor-pointer place-items-center rounded-md border-0 bg-[#f4f5f7] text-[#606773]" type="button" aria-label="关闭预览" onClick={() => setPreview(null)}><X size={20} /></button>
            </div>
            <div className="h-[620px] min-h-0 overflow-hidden bg-[#eef1f5] p-[18px]">
              <TemplateResumePreview resume={sampleResume} template={preview} scale={0.52} />
            </div>
            <button className="m-[14px_18px_18px] h-[42px] shrink-0 cursor-pointer rounded-[7px] border-0 bg-[#3279ed] font-semibold text-white" type="button" onClick={() => useTemplate(preview)}>
              使用此模版
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
