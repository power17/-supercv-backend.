import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { EditorPage } from './pages/EditorPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ResumeListPage } from './pages/ResumeListPage'
import { WechatLoginCallbackPage } from './pages/WechatLoginCallbackPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/wechat/callback" element={<WechatLoginCallbackPage />} />
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <ResumeListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume/:id/edit"
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
