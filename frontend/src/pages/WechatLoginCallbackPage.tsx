import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { wechatLogin } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { wechatLoginStateKey } from '../components/WechatQrLogin'

export function WechatLoginCallbackPage() {
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const expectedState = sessionStorage.getItem(wechatLoginStateKey)

    if (!code || !state) {
      setError('微信未返回有效的登录授权信息，请重新扫码。')
      return
    }
    if (!expectedState || state !== expectedState) {
      setError('登录状态校验失败，请返回后重新扫码。')
      return
    }

    let cancelled = false
    wechatLogin(code, state)
      .then((token) => {
        if (cancelled) return
        sessionStorage.removeItem(wechatLoginStateKey)
        login(token)
        navigate('/resume', { replace: true })
      })
      .catch(() => {
        if (!cancelled) setError('微信登录失败，请稍后重试。')
      })

    return () => {
      cancelled = true
    }
  }, [login, navigate, searchParams])

  return (
    <main className="wechat-callback-page">
      <section>
        {error ? (
          <>
            <h1>登录未完成</h1>
            <p>{error}</p>
            <button type="button" onClick={() => navigate('/login', { replace: true })}>返回登录</button>
          </>
        ) : (
          <>
            <LoaderCircle className="spin" size={28} />
            <h1>正在完成微信登录</h1>
            <p>请稍候，不要关闭此页面。</p>
          </>
        )}
      </section>
    </main>
  )
}
