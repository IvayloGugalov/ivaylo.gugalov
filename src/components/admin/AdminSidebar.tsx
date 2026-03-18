import { FileText, LayoutDashboard, Shield } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin', exact: true },
  { icon: FileText, label: 'Posts', to: '/admin/posts', exact: false },
] as const

const baseNavClass =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors'

const activeNavClass =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-accent text-accent-foreground'

export function AdminSidebar() {
  return (
    <aside className='fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-card'>
      {/* Logo / title */}
      <div className='flex h-14 items-center gap-2 border-b border-border px-4'>
        <Shield className='size-5 text-primary' />
        <span className='font-semibold text-foreground'>Admin</span>
      </div>

      {/* Navigation */}
      <nav className='flex flex-col gap-1 p-3'>
        {navItems.map(({ icon: Icon, label, to, exact }) => (
          <Link
            key={to}
            to={to}
            className={baseNavClass}
            activeProps={{ className: activeNavClass }}
            activeOptions={{ exact }}
          >
            <Icon className='size-4' />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
