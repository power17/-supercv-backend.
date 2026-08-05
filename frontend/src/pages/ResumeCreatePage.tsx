import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createResume, listTemplates } from '../api/resume'
import { useAuth } from '../auth/AuthContext'
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
  const [creatingId, setCreatingId] = useState<number | null>(null)
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

  async function useTemplate(template: Template) {
    if (!auth) return
    setCreatingId(template.id)
    setError('')
    try {
      const resume = await createResume(auth, '我的专业简历', template.id)
      navigate(`/resume/${resume.id}/edit`)
    } catch {
      setError('创建简历失败，请稍后重试')
      setCreatingId(null)
    }
  }

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="min-h-[calc(100vh-105px)] bg-white text-[#24272e]">
      <main className="mx-auto w-[min(1280px,calc(100%-40px))] py-[68px] pb-20 max-sm:w-[calc(100%-28px)] max-sm:pt-[38px]">
        <section className="mx-auto mb-[50px] grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-lg:gap-y-[22px] max-sm:mb-8 max-sm:grid-cols-1" aria-label="简历优化步骤">
          {steps.map((step, index) => (
            <div
              className={`relative flex min-h-[82px] gap-3 pr-6 max-sm:min-h-0 max-sm:after:hidden [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:top-4 [&:not(:last-child)]:after:right-0 [&:not(:last-child)]:after:h-px [&:not(:last-child)]:after:w-[38%] [&:not(:last-child)]:after:bg-[#ebedf0] ${index === 0 ? 'text-[#34373d]' : 'text-[#a2a5aa]'}`}
              key={step.title}
            >
              <div className={`grid size-8 shrink-0 place-items-center rounded-full text-sm ${index === 0 ? 'bg-[#287df0] text-white' : 'bg-[#f3f4f5] text-[#8a8e95]'}`}>
                {index + 1}
              </div>
              <div>
                <h2 className="mt-1 mb-[7px] text-[15px] font-medium">{step.title}</h2>
                <p className="m-0 max-w-[185px] text-xs leading-[1.65]">{step.description}</p>
              </div>
            </div>
          ))}
        </section>

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-[7px] border border-[#f1d3d5] bg-[#fff7f7] px-[15px] py-3 text-[13px] text-[#b84951]">
            <span>{error}</span>
            <button className="cursor-pointer border-0 bg-transparent text-[#2b72e5]" type="button" onClick={() => setReloadKey((value) => value + 1)}>重新加载</button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center gap-[9px] text-[#7d8490]"><LoaderCircle className="spin" /> 正在加载简历模版</div>
        ) : templates.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center text-[#7d8490]">暂时没有可用的公开模版</div>
        ) : (
          <section className="grid grid-cols-4 gap-x-6 gap-y-7 max-lg:grid-cols-3 max-md:grid-cols-2 max-md:gap-x-3 max-md:gap-y-4 max-[460px]:grid-cols-1" aria-label="简历模版列表">
            {templates.map((template) => (
              <article className="group overflow-hidden rounded-[10px] border border-[#e5e9f0] bg-white p-[14px] transition hover:-translate-y-0.5 hover:border-[#cad9f4] hover:shadow-[0_10px_28px_rgba(38,70,120,0.09)] max-md:p-[9px]" key={template.id}>
                <button className="group/image relative flex h-[375px] w-full cursor-zoom-in items-start justify-center overflow-hidden border-0 bg-[#f7f8fa] p-0 max-md:h-[245px] max-[460px]:h-[420px]" type="button" onClick={() => setPreview(template)}>
                  <TemplateThumbnail template={template} />
                  <span className="absolute inset-0 flex items-center justify-center gap-[7px] bg-[rgba(24,34,51,0.37)] text-[13px] font-semibold text-white opacity-0 transition-opacity group-hover/image:opacity-100"><Eye size={17} /> 查看大图</span>
                </button>
                <h3 className="mt-4 mb-3 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold text-[#202329]">{template.name}</h3>
                <div className="grid grid-cols-2 overflow-hidden rounded-md border border-[#e7eaf0]">
                  <button className="flex h-[31px] cursor-pointer items-center justify-center gap-[5px] border-0 border-r border-[#e7eaf0] bg-[#f9fafb] text-xs font-semibold text-[#2674eb] hover:bg-[#f1f6ff] disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={creatingId !== null} onClick={() => useTemplate(template)}>
                    {creatingId === template.id ? <LoaderCircle className="spin" size={15} /> : '使用'}
                  </button>
                  <button className="h-[31px] cursor-pointer border-0 bg-[#f9fafb] text-xs text-[#4f5662] hover:bg-[#f1f6ff]" type="button" onClick={() => setPreview(template)}>预览</button>
                </div>
              </article>
            ))}
          </section>
        )}

        {!loading && count > PAGE_SIZE && (
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
            <div className="flex min-h-0 justify-center overflow-auto bg-[#eef1f5] p-[18px] [&>img]:h-auto [&>img]:min-h-[580px] [&>img]:w-[min(430px,100%)] [&>img]:bg-white [&>img]:object-contain [&>img]:shadow-[0_5px_18px_rgba(31,43,62,0.12)] [&>div]:h-auto [&>div]:min-h-[580px] [&>div]:w-[min(430px,100%)]">
              <TemplateThumbnail template={preview} />
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

function TemplateThumbnail({ template }: { template: Template }) {
  const [failed, setFailed] = useState(false)
  if (!template.thumbnailUrl || failed) return <TemplatePlaceholder name={template.name} />
  return (
    <img
      className="h-full w-full bg-white object-contain"
      src={template.thumbnailUrl}
      alt={`${template.name}预览图`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function TemplatePlaceholder({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-stretch bg-white px-[25px] py-7 text-left text-[#1f2937]" aria-label={`${name}暂无缩略图`}>
      <strong className="mb-5 text-center">简历</strong>
      <PlaceholderLine />
      <PlaceholderLine short />
      <PlaceholderLine />
      <PlaceholderTitle>专业技能</PlaceholderTitle>
      <PlaceholderLine short />
      <PlaceholderLine />
      <PlaceholderTitle>工作经历</PlaceholderTitle>
      <PlaceholderLine short />
      <PlaceholderLine />
    </div>
  )
}

function PlaceholderLine({ short = false }: { short?: boolean }) {
  return <span className={`my-[5px] h-1 rounded-sm bg-[#d8dce3] ${short ? 'w-3/4' : 'w-full'}`} />
}

function PlaceholderTitle({ children }: { children: string }) {
  return <i className="mt-[18px] mb-[3px] border-b-2 border-[#3b7af0] pb-[5px] text-[11px] not-italic text-[#3b7af0]">{children}</i>
}
