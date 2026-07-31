import { LogOut, UserRound } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Brand } from './Brand'

export function Header({ transparent = false }: { transparent?: boolean }) {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className={`site-header ${transparent ? 'site-header-transparent' : ''}`}>
      <div className="header-inner">
        <Brand />
        <nav className="main-nav" aria-label="主导航">
          <NavLink to="/">首页</NavLink>
          <a href="/#templates">简历模板</a>
          <a href="/#features">产品功能</a>
          <a href="/#stories">用户评价</a>
        </nav>
        <div className="header-actions">
          {auth ? (
            <>
              <Link className="button button-ghost header-account" to="/resume">
                <UserRound size={17} />
                我的简历
              </Link>
              <button
                className="icon-button"
                type="button"
                title="退出登录"
                onClick={handleLogout}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link className="text-link" to="/login">
                登录
              </Link>
              <Link className="button button-primary button-small" to="/login">
                免费制作简历
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

