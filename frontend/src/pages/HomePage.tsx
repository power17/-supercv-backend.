import {
  ArrowRight,
  BrainCircuit,
  Building2,
  Crosshair,
  FileCheck2,
  LoaderCircle,
  Mic2,
  Network,
  Smartphone,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { type CSSProperties, type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { devLogin } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { WechatQrLogin } from '../components/WechatQrLogin'

const engines = [
  {
    icon: Building2,
    title: '基于不同公司面试风格',
    detail: '字节、腾讯、阿里、拼多多等一线互联网公司真实面经数据支撑，题目与建议更贴近目标公司的考察偏好。',
  },
  {
    icon: UserRound,
    title: '基于大厂面试官经验 Skills',
    detail: '融合资深面试官的真实招聘经验，从项目深度、技术能力和表达逻辑等维度给出专业建议。',
  },
  {
    icon: Network,
    title: '基于岗位知识图谱',
    detail: '根据岗位、职级和技术方向建立能力图谱，找到简历内容与目标职位之间的关键差距。',
  },
  {
    icon: BrainCircuit,
    title: 'AI 多维诊断与追问',
    detail: '不止润色文字，还会围绕经历真实性、业务价值与技术难点继续追问，帮助你补齐面试证据链。',
  },
]

const products = [
  {
    icon: FileCheck2,
    title: '简历诊断优化',
    text: '从岗位匹配、项目亮点到表达逻辑逐项诊断，让每一段经历都更有说服力。',
    color: '#477ff2',
  },
  {
    icon: Crosshair,
    title: '即时简历押题',
    text: '结合目标公司与简历内容，生成更贴近真实面试场景的高频问题与回答思路。',
    color: '#eea445',
  },
  {
    icon: Mic2,
    title: '体验模拟面试',
    text: 'AI 面试官连续追问并即时反馈，提前训练表达结构、技术深度与临场反应。',
    color: '#64bd79',
  },
]

export function HomePage({ initialLoginOpen = false }: { initialLoginOpen?: boolean }) {
  const [loginOpen, setLoginOpen] = useState(initialLoginOpen)
  const [activeEngine, setActiveEngine] = useState(0)
  const [alternateLogin, setAlternateLogin] = useState(false)
  const [telephone, setTelephone] = useState('13800138000')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { auth, login, loginDemo } = useAuth()
  const navigate = useNavigate()

  function openFeature() {
    if (auth) navigate('/resume')
    else setLoginOpen(true)
  }

  function closeLogin() {
    setLoginOpen(false)
    setAlternateLogin(false)
    setError('')
    if (initialLoginOpen) navigate('/', { replace: true })
  }

  function handleQuickLogin() {
    loginDemo()
    navigate('/resume')
  }

  async function handleDevLogin(event: FormEvent) {
    event.preventDefault()
    if (!/^1\d{10}$/.test(telephone)) {
      setError('请输入正确的 11 位手机号码')
      return
    }
    setLoading(true)
    setError('')
    try {
      const token = await devLogin(telephone)
      login(token)
      navigate('/resume')
    } catch {
      setError('本地后端尚未启动，也可以使用演示账号登录')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="youmian-home">
      <main>
        <section className="youmian-hero">
          <div className="youmian-shell">
            <div className="youmian-hero-copy">
              <h1>
                从简历筛选到技术面试
                <br />
                数据表明通过率显著 <span>提升↗</span>
              </h1>
              <p>简历诊断优化 · 精准押题 · 模拟面试，专为职场人求职打造</p>
              <div className="youmian-hero-actions">
                <button className="home-action-primary" type="button" onClick={openFeature}>
                  <Zap size={19} fill="currentColor" /> 开始优化简历
                </button>
                <button className="home-action-card" type="button" onClick={openFeature}>
                  <Crosshair size={19} /> 立即简历押题
                </button>
                <button className="home-action-card home-action-interview" type="button" onClick={openFeature}>
                  <Mic2 size={19} /> 体验模拟面试
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="engine-section" id="engines">
          <div className="youmian-shell">
            <div className="youmian-section-heading">
              <h2>四大核心底层引擎</h2>
              <p>不是通用 AI，而是为「求职场景」深度训练的 AI 资深面试官</p>
            </div>
            <div className="engine-tabs" role="tablist">
              {engines.map(({ icon: Icon, title }, index) => (
                <button
                  className={activeEngine === index ? 'active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={activeEngine === index}
                  key={title}
                  onClick={() => setActiveEngine(index)}
                >
                  <span><Icon size={23} /></span>
                  <strong>{title}</strong>
                </button>
              ))}
            </div>
            <article className="engine-detail">
              <div>
                <span>0{activeEngine + 1}</span>
                <h3>{engines[activeEngine].title}</h3>
                <p>{engines[activeEngine].detail}</p>
              </div>
              <div className="engine-visual" aria-hidden="true">
                <i /><i /><i />
                <strong>AI</strong>
              </div>
            </article>
          </div>
        </section>

        <section className="home-products" id="products">
          <div className="youmian-shell">
            <div className="youmian-section-heading">
              <h2>求职全流程，练到真正会</h2>
              <p>围绕你的目标岗位和真实经历，完成从简历到面试的系统训练</p>
            </div>
            <div className="home-product-grid">
              {products.map(({ icon: Icon, title, text, color }) => (
                <article key={title} style={{ '--product-color': color } as CSSProperties}>
                  <span><Icon size={25} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <button type="button" onClick={openFeature}>立即体验 <ArrowRight size={16} /></button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="youmian-cta">
          <div className="youmian-shell">
            <h2>准备好拿下下一次面试了吗？</h2>
            <p>从一份更有竞争力的简历开始。</p>
            <button type="button" onClick={openFeature}>免费开始体验 <ArrowRight size={18} /></button>
          </div>
        </section>
      </main>

      <footer className="youmian-footer">
        <div className="youmian-shell"><strong>有面</strong><span>AI 求职训练平台</span><small>© 2026 SuperCV</small></div>
      </footer>

      {loginOpen && (
        <div className="quick-login-backdrop" role="presentation">
          <section className="quick-login-modal" role="dialog" aria-modal="true" aria-labelledby="quick-login-title">
            <button className="quick-login-close" type="button" aria-label="关闭登录" onClick={closeLogin}>
              <X size={22} />
            </button>
            <h2 id="quick-login-title">扫码登录</h2>

            {!alternateLogin ? (
              <WechatQrLogin onUseDevLogin={() => setAlternateLogin(true)} />
            ) : (
              <form className="alternate-login-form" onSubmit={handleDevLogin}>
                <label htmlFor="home-telephone">本地开发账号</label>
                <div>
                  <Smartphone size={18} />
                  <input
                    id="home-telephone"
                    value={telephone}
                    onChange={(event) => setTelephone(event.target.value)}
                    placeholder="请输入手机号码"
                    inputMode="tel"
                    maxLength={11}
                  />
                </div>
                {error && <p>{error}</p>}
                <button type="submit" disabled={loading}>
                  {loading && <LoaderCircle className="spin" size={17} />} 登录 / 注册
                </button>
                <button type="button" onClick={handleQuickLogin}>使用演示账号</button>
                <button type="button" onClick={() => setAlternateLogin(false)}>返回快捷登录</button>
              </form>
            )}

            <p className="quick-login-agreement">微信登录即代表同意 <a href="#agreement">《用户协议》</a></p>
          </section>
        </div>
      )}
    </div>
  )
}
