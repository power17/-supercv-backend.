import { Dropdown, type MenuProps } from 'antd'
import {
  Copy,
  FilePlus2,
  LoaderCircle,
  MoreHorizontal,
  PencilLine,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { copyResume, listResumes, removeResume } from '../api/resume'
import { useAuth } from '../auth/AuthContext'
import { ResumePreview } from '../components/ResumePreview'
import type { Resume } from '../types'

function formatDate(value?: string) {
  if (!value) return '刚刚更新'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚更新'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function UserResumePage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [operatingId, setOperatingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth) return
    setLoading(true)
    setError('')
    listResumes(auth)
      .then(setResumes)
      .catch(() => setError('简历列表加载失败，请稍后重试'))
      .finally(() => setLoading(false))
  }, [auth])

  async function handleCopy(resume: Resume) {
    if (!auth || operatingId !== null) return
    setOperatingId(resume.id)
    setError('')
    try {
      const copied = await copyResume(auth, resume)
      setResumes((current) => [copied, ...current])
    } catch {
      setError('复制简历失败，请检查剩余创建次数')
    } finally {
      setOperatingId(null)
    }
  }

  async function handleDelete(resume: Resume) {
    if (!auth || operatingId !== null) return
    if (!window.confirm(`确定删除“${resume.name}”吗？删除后无法恢复。`)) return
    setOperatingId(resume.id)
    setError('')
    try {
      await removeResume(auth, resume.id)
      setResumes((current) => current.filter((item) => item.id !== resume.id))
    } catch {
      setError('删除简历失败，请稍后重试')
    } finally {
      setOperatingId(null)
    }
  }

  function menuItems(resume: Resume): MenuProps['items'] {
    return [
      {
        key: 'edit',
        icon: <PencilLine size={15} />,
        label: '编辑简历',
        onClick: () => navigate(`/resume/${resume.id}/edit`),
      },
      {
        key: 'copy',
        icon: <Copy size={15} />,
        label: '复制简历',
        disabled: operatingId !== null,
        onClick: () => handleCopy(resume),
      },
      { type: 'divider' },
      {
        key: 'delete',
        danger: true,
        icon: <Trash2 size={15} />,
        label: '删除简历',
        disabled: operatingId !== null,
        onClick: () => handleDelete(resume),
      },
    ]
  }

  return (
    <main className="min-h-[calc(100vh-105px)] bg-[#f6f8fb] py-12 max-sm:py-7">
      <div className="mx-auto w-[min(1200px,calc(100%-40px))] max-sm:w-[calc(100%-28px)]">
        <header className="mb-8">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.5px] text-[#1f2530] max-sm:text-2xl">我的简历</h1>
            <p className="mt-2 text-sm text-[#818997]">管理、编辑并持续优化你的全部简历</p>
          </div>
        </header>

        {error ? (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-[#f0d1d4] bg-[#fff7f7] px-4 py-3 text-sm text-[#bb4851]">
            <span>{error}</span>
            <button className="cursor-pointer border-0 bg-transparent font-medium text-[#2876ed]" type="button" onClick={() => window.location.reload()}>重新加载</button>
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center gap-2 text-sm text-[#7e8795]"><LoaderCircle className="animate-spin" size={23} /> 正在加载我的简历</div>
        ) : resumes.length === 0 ? (
          <section className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfd8e7] bg-white text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-[#edf3ff] text-[#2876ed]"><FilePlus2 size={31} /></span>
            <h2 className="mt-5 text-xl font-semibold text-[#252b36]">还没有简历</h2>
            <p className="mt-2 text-sm text-[#8c94a2]">创建过的简历会展示在这里</p>
          </section>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-[#737c8b]">
              <span>全部简历</span><span>共 {resumes.length} 份</span>
            </div>
            <section className="grid grid-cols-4 gap-5 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1" aria-label="我的简历列表">
              {resumes.map((resume) => (
                <article className="group overflow-hidden rounded-xl border border-[#e1e6ee] bg-white transition hover:-translate-y-1 hover:border-[#c4d4ed] hover:shadow-[0_12px_30px_rgba(43,77,125,0.09)]" key={resume.id}>
                  <Link className="relative block h-[330px] overflow-hidden bg-[#edf0f4]" to={`/resume/${resume.id}/edit`}>
                    <div className="absolute top-0 left-1/2 w-[794px] origin-top -translate-x-1/2 scale-[0.36] shadow-sm">
                      <ResumePreview resume={resume} />
                    </div>
                    <span className="absolute inset-0 flex items-center justify-center gap-2 bg-[rgba(24,34,51,0.34)] text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100"><PencilLine size={18} /> 继续编辑</span>
                  </Link>
                  <footer className="flex min-h-[78px] items-center gap-3 border-t border-[#ebedf1] px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-semibold text-[#2b313c]">{resume.name}</h2>
                      <p className="mt-1.5 text-[11px] text-[#969eaa]">{formatDate(resume.updateTime)}</p>
                    </div>
                    {operatingId === resume.id ? (
                      <LoaderCircle className="animate-spin text-[#2876ed]" size={19} />
                    ) : (
                      <Dropdown menu={{ items: menuItems(resume) }} placement="bottomRight" trigger={['click']}>
                        <button className="grid size-8 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-[#737d8d] hover:bg-[#f1f4f8]" type="button" aria-label={`${resume.name}更多操作`}><MoreHorizontal size={20} /></button>
                      </Dropdown>
                    )}
                  </footer>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
