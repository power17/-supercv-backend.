import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ResumeCreatePage } from '../pages/ResumeCreatePage'
import { ResumeListPage } from '../pages/ResumeListPage'
import { WechatLoginCallbackPage } from '../pages/WechatLoginCallbackPage'
import { SiteLayout } from './SiteLayout'

const UserResumePage = lazy(() => import('../pages/UserResumePage').then((module) => ({ default: module.UserResumePage })))
const EditorPage = lazy(() => import('../pages/EditorPage').then((module) => ({ default: module.EditorPage })))

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="login/wechat/callback" element={<WechatLoginCallbackPage />} />
        <Route
          path="resume"
          element={
            <ProtectedRoute>
              <ResumeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="user/resume"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex min-h-[420px] items-center justify-center text-sm text-[#7e8795]">正在加载我的简历</div>}>
                <UserResumePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="resume/create"
          element={
            <ProtectedRoute>
              <ResumeCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="resume/:id/edit"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex min-h-[420px] items-center justify-center text-sm text-[#7e8795]">正在打开简历编辑器</div>}>
                <EditorPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
