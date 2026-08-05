import { Bell, Coins, Crown, Gift, LogOut, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function YoumianHeader() {
  const { auth, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const homeActive = pathname === '/' || pathname.startsWith('/login')
  const resumeActive = pathname.startsWith('/resume')

  useEffect(() => {
    setUserMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!userMenuOpen) return
    function closeOnOutsideClick(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) setUserMenuOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [userMenuOpen])

  function handleLogout() {
    setUserMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shrink-0 print:hidden">
      <div className="flex h-10 items-center justify-center gap-2 overflow-hidden bg-[#45a8c2] px-4 py-2 text-center text-[13px] font-semibold whitespace-nowrap text-white tracking-[0.1px]">
        <span>📣</span> 招聘季超值优惠，新人注册送 50 虚拟体验币，邀请好友注册再送 50 虚拟体验币 🎉
      </div>

      <header className="relative z-20 h-[65px] border-b border-[#e9ebef] bg-white">
        <div className="mx-auto flex h-full w-[min(1280px,calc(100%-40px))] items-center max-sm:w-[calc(100%-28px)]">
          <Link className="mr-[42px] flex items-center gap-[9px] text-[#3477ef] max-sm:mr-0" to="/" aria-label="有面首页">
            <span className="grid size-[29px] place-items-center rounded-lg bg-[#4b82f3] text-base font-black text-white shadow-[0_4px_10px_rgba(58,112,230,0.2)]">
              <span className="-rotate-[8deg]">↗</span>
            </span>
            <strong className="text-[21px] tracking-[1px]">有面</strong>
          </Link>
          <nav className="flex h-full items-center gap-[35px] max-lg:gap-5 max-sm:hidden" aria-label="主导航">
            <HeaderLink active={homeActive} to="/">首页</HeaderLink>
            <HeaderLink active={resumeActive} to="/resume">简历优化</HeaderLink>
            <HeaderLink to="/#products">简历押题</HeaderLink>
            <HeaderLink to="/#products">模拟面试</HeaderLink>
          </nav>
          {auth ? (
            <div className="ml-auto flex items-center gap-[9px]">
              <button className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-[17px] border border-[#f2d18f] bg-[#fffaf0] px-3 text-xs text-[#ba7c1d] max-lg:hidden" type="button">
                <Gift size={14} /> 邀请有赏
              </button>
              <button className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-[17px] border border-[#bcd4ff] bg-[#f8fbff] px-3 text-xs text-[#2472ec] max-lg:hidden" type="button">
                <Crown size={14} /> 充值中心
              </button>
              <button className="inline-flex h-[34px] cursor-pointer items-center justify-center gap-[5px] rounded-[18px] border border-[#dce6f8] bg-[#f8fbff] px-[11px] text-sm font-bold text-[#3975e9]" type="button">
                <Coins size={14} /> 50 币
              </button>
              <button className="grid size-[34px] cursor-pointer place-items-center border-0 bg-transparent text-[#262a31] max-sm:hidden" type="button" aria-label="通知">
                <Bell size={17} fill="currentColor" />
              </button>
              <div className="relative" ref={userMenuRef}>
                <button
                  className="grid size-[31px] cursor-pointer place-items-center rounded-full border-0 bg-[linear-gradient(145deg,#27394d,#c2a279)] text-xs font-bold text-white shadow-[0_2px_7px_rgba(29,40,55,0.2)] ring-[#3477ef] transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  type="button"
                  aria-label="打开用户菜单"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                  {String(auth.uid).slice(-1)}
                </button>
                {userMenuOpen ? (
                  <div className="absolute top-[42px] right-0 z-50 w-[190px] overflow-hidden rounded-lg border border-[#e5e8ee] bg-white py-1.5 shadow-[0_12px_32px_rgba(24,34,51,0.16)]" role="menu">
                    <div className="flex items-center gap-2.5 border-b border-[#eef0f3] px-3.5 py-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf3ff] text-[#3477ef]"><UserRound size={16} /></span>
                      <span className="min-w-0">
                        <strong className="block truncate text-xs font-semibold text-[#303642]">用户 {auth.uid}</strong>
                        <small className="mt-0.5 block text-[10px] text-[#9aa1ad]">个人账户</small>
                      </span>
                    </div>
                    <button className="flex w-full cursor-pointer items-center gap-2.5 border-0 bg-white px-3.5 py-2.5 text-left text-xs text-[#5c6472] hover:bg-[#fff3f3] hover:text-[#d3414b]" type="button" role="menuitem" onClick={handleLogout}>
                      <LogOut size={15} /> 退出登录
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <Link className="ml-auto cursor-pointer border-0 bg-transparent px-[11px] py-[9px] text-[15px] text-[#22262e]" to="/login">
              登录 / 注册
            </Link>
          )}
        </div>
      </header>
    </div>
  )
}

function HeaderLink({
  active = false,
  children,
  to,
}: {
  active?: boolean
  children: string
  to: string
}) {
  return (
    <Link
      className={`relative flex h-full items-center text-sm ${
        active
          ? 'font-semibold text-[#2876ed] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#2876ed]'
          : 'text-[#5c616b] hover:text-[#2876ed]'
      }`}
      to={to}
    >
      {children}
    </Link>
  )
}
