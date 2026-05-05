'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, BarChart2, BookMarked,
  LogOut, Settings, Bell, User, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

const NAV = [
  {
    href:  '/dashboard',
    label: 'Signal transitions',
    icon:  TrendingUp,
    desc:  'Bear ↔ Bull crossings',
  },
  {
    href:  '/dashboard/monthly',
    label: 'Monthly trend',
    icon:  BarChart2,
    desc:  'S&P 500 month by month',
  },
  {
    href:  '/dashboard/watchlist',
    label: 'Watchlist',
    icon:  BookMarked,
    desc:  'Barchart Premier sync',
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-0)' }}>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 flex flex-col transition-transform duration-300
                    md:relative md:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5"
             style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}>
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight"
                 style={{ color: 'var(--text-primary)' }}>
              SP500
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Intelligence
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                                transition-all group relative`}
                    style={{
                      background: active ? 'var(--accent-dim)' : 'transparent',
                      color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    }}>
                {active && (
                  <motion.div layoutId="nav-indicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                              style={{ background: 'var(--accent)' }} />
                )}
                <item.icon size={16} className="flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-3 space-y-1"
             style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}>
            <Settings size={15} />
            <span>Settings</span>
          </Link>
          <button onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                             transition-colors text-left"
                  style={{ color: 'var(--text-secondary)' }}>
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-2 mt-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                 style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate"
                   style={{ color: 'var(--text-primary)' }}>
                {user?.username || 'User'}
              </div>
              <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setSidebarOpen(false)}
                      className="fixed inset-0 z-30 md:hidden"
                      style={{ background: 'rgba(0,0,0,0.6)' }} />
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 h-14 flex-shrink-0"
                style={{
                  background: 'var(--surface-1)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-1.5 rounded-lg"
                    style={{ color: 'var(--text-secondary)' }}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Dashboard</span>
              <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-primary)' }}>
                {NAV.find(n => n.href === pathname)?.label || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                 style={{ background: 'var(--col-bull-glow)', color: 'var(--col-bull)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                    style={{ background: 'var(--col-bull)' }} />
              Market open
            </div>
            <button className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-secondary)' }}>
              <Bell size={17} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
