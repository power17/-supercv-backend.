# SuperCV Frontend

基于 React 19、TypeScript 和 Vite 的 SuperCV 前端练习项目，使用 pnpm 管理依赖。

## 已实现

- 产品首页与简历模板展示
- 微信开放平台扫码登录
- 开发环境手机号登录
- 无后端演示账号
- 我的简历列表
- 新建和删除简历
- 简历内容编辑
- 简历主题与排版设置
- A4 实时预览
- 保存到后端或浏览器本地存储
- 浏览器打印/导出 PDF

## 本地启动

```bash
pnpm install
pnpm dev
```

默认访问 <http://localhost:5173>。Vite 会把 `/v1` 请求代理至
`http://localhost:8088`。

如果后端端口或地址不同，或需要启用微信扫码登录，复制 `.env.example` 为 `.env.local`：

```bash
VITE_API_BASE_URL=http://localhost:8088
VITE_WECHAT_APP_ID=微信开放平台网站应用 AppID
VITE_WECHAT_REDIRECT_URI=https://你的前端域名/login/wechat/callback
```

## 登录方式

### 演示账号

在登录页点击“体验演示账号”。数据保存在浏览器 `localStorage` 中，不需要启动后端。

### 本地后端

先以 `dev` Profile 启动 Spring Boot 后端，然后在登录页选择“本地开发登录”。
该方式调用：

```text
POST /v1/login/dev/telephone
```

### 微信扫码登录

登录弹窗使用微信开放平台的二维码组件。扫码确认后，微信将浏览器重定向到
`VITE_WECHAT_REDIRECT_URI`，前端会读取微信返回的 `code`，调用后端接口完成登录：

```text
GET /v1/login/wechat/callback?code=<微信授权码>&key=<随机 state>
```

上线前需完成以下配置：

1. 在微信开放平台创建并审核“网站应用”，并登记前端域名的完整回调地址。
2. 在前端 `.env.local` 设置 `VITE_WECHAT_APP_ID` 和 `VITE_WECHAT_REDIRECT_URI`；`localhost` 不能作为正式微信扫码回调地址。
3. 在后端 `application-prod.yaml` 设置同一应用的 `wxOpen.appID` 与仅由后端保存的 `wxOpen.appSecret`。

`state` 由前端随机生成并在回调时校验，用于防止跨站请求伪造。不要将 `AppSecret` 写入任何 `VITE_` 变量。

## 校验

```bash
pnpm typecheck
pnpm build
```
