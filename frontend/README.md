# SuperCV Frontend

基于 React 19、TypeScript 和 Vite 的 SuperCV 前端练习项目，使用 pnpm 管理依赖。

## 已实现

- 产品首页与简历模板展示
- 微信登录视觉稿
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

如果后端端口或地址不同，复制 `.env.example` 为 `.env.local`：

```bash
VITE_API_BASE_URL=http://localhost:8088
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

生产环境微信扫码登录需要在后端及微信开放平台配置 AppID、回调地址和对应二维码登录流程。

## 校验

```bash
pnpm typecheck
pnpm build
```

