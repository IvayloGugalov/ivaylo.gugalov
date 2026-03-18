import { Link } from '@tanstack/react-router'
import { FileText, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <aside className='sticky h-dvh pr-10 border-r border-border bg-card'>
      {/* Navigation */}
      <nav className='flex flex-col gap-1 p-3'>
        {navItems.map(({ icon: Icon, label, to, exact }) => (
          <Link
            key={to}
            to={to}
            className={cn(baseNavClass)}
            activeProps={{ className: cn(activeNavClass) }}
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
