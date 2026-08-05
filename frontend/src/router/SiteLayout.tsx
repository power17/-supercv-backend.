import { Outlet } from 'react-router-dom'
import { YoumianHeader } from '../components/YoumianHeader'

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <YoumianHeader />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
