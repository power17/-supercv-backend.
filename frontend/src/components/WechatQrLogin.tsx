import { useEffect, useId, useState } from 'react'

declare global {
  interface Window {
    WxLogin?: new (options: {
      id: string
      appid: string
      scope: string
      redirect_uri: string
      state: string
      style?: string
      href?: string
    }) => unknown
  }
}

const wechatScriptId = 'supercv-wechat-login-sdk'
export const wechatLoginStateKey = 'supercv_wechat_login_state'

function createState() {
  return crypto.randomUUID().replaceAll('-', '')
}

function loadWechatLoginSdk() {
  if (window.WxLogin) return Promise.resolve()

  const existingScript = document.getElementById(wechatScriptId) as HTMLScriptElement | null
  if (existingScript) {
    return new Promise<void>((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('微信登录组件加载失败')), { once: true })
    })
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = wechatScriptId
    script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('微信登录组件加载失败'))
    document.head.append(script)
  })
}

type WechatQrLoginProps = {
  onUseDevLogin: () => void
}

export function WechatQrLogin({ onUseDevLogin }: WechatQrLoginProps) {
  const reactId = useId()
  const containerId = `wechat-qr-${reactId.replaceAll(':', '')}`
  const [state] = useState(createState)
  const [error, setError] = useState('')
  const appId = import.meta.env.VITE_WECHAT_APP_ID
  const redirectUri = import.meta.env.VITE_WECHAT_REDIRECT_URI
    ?? `${window.location.origin}/login/wechat/callback`

  useEffect(() => {
    if (!appId) return

    let cancelled = false
    sessionStorage.setItem(wechatLoginStateKey, state)

    loadWechatLoginSdk()
      .then(() => {
        if (cancelled || !window.WxLogin) return
        new window.WxLogin({
          id: containerId,
          appid: appId,
          scope: 'snsapi_login',
          redirect_uri: redirectUri,
          state,
        })
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : '微信登录组件加载失败')
        }
      })

    return () => {
      cancelled = true
      document.getElementById(containerId)?.replaceChildren()
    }
  }, [appId, containerId, redirectUri, state])

  if (!appId) {
    return (
      <div className="wechat-qr-login wechat-qr-login-unconfigured">
        <strong>微信扫码登录尚未配置</strong>
        <p>请在前端 `.env.local` 中设置 `VITE_WECHAT_APP_ID` 后重启开发服务。</p>
        <button type="button" onClick={onUseDevLogin}>使用本地开发账号</button>
      </div>
    )
  }

  return (
    <div className="wechat-qr-login">
      <div id={containerId} className="wechat-qr-code" aria-label="微信登录二维码" />
      {error ? <p className="wechat-qr-error">{error}</p> : <p>请使用微信扫描二维码登录</p>}
      <button className="other-login-button" type="button" onClick={onUseDevLogin}>
        使用本地开发账号
      </button>
    </div>
  )
}
