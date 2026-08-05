import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { EditorPage } from '../pages/EditorPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ResumeCreatePage } from '../pages/ResumeCreatePage'
import { ResumeListPage } from '../pages/ResumeListPage'
import { WechatLoginCallbackPage } from '../pages/WechatLoginCallbackPage'
import { SiteLayout } from './SiteLayout'

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
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
