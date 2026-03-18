import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth'
import { useAuthStore } from '@/store/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Link } from '@tanstack/react-router'

const getAdminSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  return auth.api.getSession({ headers })
})

export const Route = createFileRoute('/admin')({
  loader: async () => {
    const session = await getAdminSession()
    if (session?.user?.role !== 'admin') {
      throw redirect({ to: '/' })
    }
    return { user: session.user }
  },
  component: AdminLayout,
})

function AdminLayout() {
  // Client-side guard (defense against CSR navigation bypassing loader)
  const user = useAuthStore((s) => s.user)
  const isAuthLoading = useAuthStore((s) => s.isLoading)

  // While auth is hydrating, render nothing (avoids flash)
  if (isAuthLoading) return null

  // Once resolved, gate non-admins
  if (user === null || user.role !== 'admin') {
    return (
      <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4'>
        <p className='text-muted-foreground'>
          You don't have permission to access this page.
        </p>
        <Link to='/' className='text-sm underline'>
          Go home
        </Link>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen'>
      <AdminSidebar />
      <div className='flex-1 overflow-auto p-6'>
        <Outlet />
      </div>
    </div>
  )
}
