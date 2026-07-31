import {
  ArrowRight,
  Bell,
  ChevronRight,
  Clock3,
  Coins,
  Copy,
  Crown,
  FilePlus2,
  LoaderCircle,
  Menu,
  MoreHorizontal,
  PencilLine,
  Plus,
  Trash2,
  UserRound,
  Zap,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { copyResume, createResume, listResumes, removeResume } from '../api/resume'
import { useAuth } from '../auth/AuthContext'
import { Modal } from '../components/Modal'
import { ResumePreview } from '../components/ResumePreview'
import type { Resume } from '../types'

function formatDate(value?: string) {
  if (!value) return '刚刚更新'
  const date = new Date(value)
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日更新`
}

export function ResumeListPage() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('我的专业简历')
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!auth) return
    listResumes(auth)
      .then(setResumes)
      .catch(() => setError('简历列表加载失败，请确认后端服务已启动'))
      .finally(() => setLoading(false))
  }, [auth])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!auth || !newName.trim()) return
    setCreating(false)
    setLoading(true)
    try {
      const resume = await createResume(auth, newName.trim())
      navigate(`/resume/${resume.id}/edit`)
    } catch {
      setError('新建简历失败，请稍后再试')
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!auth || !window.confirm('确定删除这份简历吗？此操作无法撤销。')) return
    await removeResume(auth, id)
    setResumes((items) => items.filter((item) => item.id !== id))
    setOpenMenu(null)
  }

  async function handleCopy(resume: Resume) {
    if (!auth) return
    setOpenMenu(null)
    try {
      const copy = await copyResume(auth, resume)
      setResumes((items) => [copy, ...items])
    } catch {
      setError('复制简历失败，请稍后再试')
    }
  }

  function handleOptimize() {
    if (resumes[0]) {
      navigate(`/resume/${resumes[0].id}/edit`)
    } else {
      setCreating(true)
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="resume-hub-page">
      <div className="recruit-promo">
        <span>📣</span> 招聘季超值优惠，新人注册送 50 虚拟体验币，邀请好友注册再送 50 虚拟体验币 🎉
      </div>

      <header className="resume-hub-header">
        <div className="resume-hub-brand">
          <Link to="/" aria-label="有面首页">
            <span className="youmian-mark"><span>↗</span></span>
            <strong>有面</strong>
          </Link>
          <button
            className="hub-menu-button"
            type="button"
            aria-label="打开导航"
            onClick={() => setMobileNavOpen((value) => !value)}
          >
            <Menu size={20} />
          </button>
          {mobileNavOpen && (
            <nav className="hub-quick-nav">
              <Link to="/resume">简历中心</Link>
              <a href="/#templates">简历模板</a>
              <a href="/#features">智能优化</a>
            </nav>
          )}
        </div>
        <div className="resume-hub-actions">
          <button className="membership-pill" type="button" title="会员中心">
            <Crown size={17} />
          </button>
          <button className="coin-pill" type="button" title="虚拟体验币">
            <Coins size={15} /> <span>50</span>
          </button>
          <button className="hub-icon-button" type="button" title="通知">
            <Bell size={18} fill="currentColor" />
          </button>
          <div className="hub-account">
            <button
              className="hub-avatar"
              type="button"
              aria-label="账户菜单"
              onClick={() => setAccountOpen((value) => !value)}
            >
              {auth?.demo ? '演' : String(auth?.uid ?? '我').slice(-1)}
            </button>
            {accountOpen && (
              <div className="hub-account-menu">
                <div><UserRound size={16} /> {auth?.demo ? '演示用户' : `用户 ${auth?.uid}`}</div>
                <button type="button" onClick={handleLogout}>退出登录</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="resume-diagnosis-hero">
          <div className="resume-hub-container">
            <h1>简历诊断，智能优化</h1>
            <p>「资深面试官（AI 蒸馏）」多维度诊断与优化，精选模板在线编辑，打造连投必面的简历</p>
            <div className="resume-diagnosis-actions">
              <button className="diagnosis-primary" type="button" onClick={handleOptimize}>
                <Zap size={19} fill="currentColor" /> 开启诊断优化
              </button>
              <button
                className="diagnosis-secondary"
                type="button"
                onClick={() => document.getElementById('recent-resumes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                查看我的简历 <ChevronRight size={21} />
              </button>
            </div>
          </div>
        </section>

        <section className="recent-resumes-section" id="recent-resumes">
          <div className="resume-hub-container">
            <div className="recent-resumes-heading">
              <h2>最近编辑</h2>
              <button type="button" onClick={() => setShowAll((value) => !value)}>
                {showAll ? '收起' : '查看全部'} <ArrowRight size={15} />
              </button>
            </div>

          {error && (
            <div className="inline-alert">
              {error}
              {auth?.demo ? null : (
                <button type="button" onClick={() => window.location.reload()}>
                  重新加载
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="page-loading">
              <LoaderCircle className="spin" size={27} />
              正在加载你的简历
            </div>
          ) : resumes.length === 0 ? (
            <section className="empty-resumes">
              <div>
                <FilePlus2 size={34} />
              </div>
              <h2>创建你的第一份简历</h2>
              <p>选择专业模板，清晰呈现你的经历与能力。</p>
              <button className="button button-primary" type="button" onClick={() => setCreating(true)}>
                <Plus size={18} /> 新建简历
              </button>
            </section>
          ) : (
            <>
              <article className="recent-resume-card">
                <Link className="recent-resume-preview" to={`/resume/${resumes[0].id}/edit`}>
                  <ResumePreview resume={resumes[0]} miniature />
                  <span className="recent-edit-overlay"><PencilLine size={18} /> 继续编辑</span>
                </Link>
                <ResumeCardFooter
                  resume={resumes[0]}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                />
              </article>

              {showAll && <div className="all-resumes-panel">
                <div className="resume-list-meta">
                  <span>全部简历</span>
                  <small>共 {resumes.length} 份</small>
                </div>
                <div className="resume-card-grid">
                <button className="new-resume-card" type="button" onClick={() => setCreating(true)}>
                  <span>
                    <Plus size={27} />
                  </span>
                  <strong>新建简历</strong>
                  <small>从经典模板开始</small>
                </button>
                {resumes.map((resume) => (
                  <article className="resume-list-card" key={resume.id}>
                    <Link className="resume-thumbnail" to={`/resume/${resume.id}/edit`}>
                      <ResumePreview resume={resume} miniature />
                      <span className="resume-edit-overlay">
                        <PencilLine size={18} /> 继续编辑
                      </span>
                    </Link>
                    <ResumeCardFooter
                      resume={resume}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                      onCopy={handleCopy}
                      onDelete={handleDelete}
                    />
                  </article>
                ))}
                </div>
              </div>
              }
            </>
          )}
          </div>
        </section>
      </main>

      {creating && (
        <Modal
          title="新建简历"
          description="先为简历取一个名称，之后可以随时修改。"
          onClose={() => setCreating(false)}
        >
          <form className="create-resume-form" onSubmit={handleCreate}>
            <label htmlFor="resume-name">简历名称</label>
            <input
              id="resume-name"
              autoFocus
              maxLength={30}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
            <div className="modal-actions">
              <button className="button button-ghost" type="button" onClick={() => setCreating(false)}>
                取消
              </button>
              <button className="button button-primary" type="submit">
                创建并编辑 <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function ResumeCardFooter({
  resume,
  openMenu,
  setOpenMenu,
  onCopy,
  onDelete,
}: {
  resume: Resume
  openMenu: number | null
  setOpenMenu: (id: number | null) => void
  onCopy: (resume: Resume) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="resume-card-footer">
      <div>
        <h3>{resume.name}</h3>
        <p><Clock3 size={13} /> {formatDate(resume.updateTime)}</p>
      </div>
      <button
        className="resume-menu-button"
        type="button"
        aria-label="更多操作"
        onClick={() => setOpenMenu(openMenu === resume.id ? null : resume.id)}
      >
        <MoreHorizontal size={20} />
      </button>
      {openMenu === resume.id && (
        <div className="resume-card-menu">
          <Link to={`/resume/${resume.id}/edit`}><PencilLine size={15} /> 编辑简历</Link>
          <button type="button" onClick={() => onCopy(resume)}><Copy size={15} /> 复制简历</button>
          <button className="danger" type="button" onClick={() => onDelete(resume.id)}>
            <Trash2 size={15} /> 删除简历
          </button>
        </div>
      )}
    </div>
  )
}
