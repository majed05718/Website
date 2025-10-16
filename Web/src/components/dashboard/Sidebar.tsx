'use client'

import { Home, Building2, Users, Calendar, Star, BarChart3, Settings, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { icon: Home, label: 'الرئيسية', href: '/dashboard' },
  { icon: Building2, label: 'العقارات', href: '/dashboard/properties' },
  { icon: Users, label: 'العملاء', href: '/dashboard/clients' },
  { icon: Calendar, label: 'المواعيد', href: '/dashboard/viewings' },
  { icon: Star, label: 'المفضلة', href: '/dashboard/favorites' },
  { icon: BarChart3, label: 'التقارير', href: '/dashboard/reports' },
  { icon: Settings, label: 'الإعدادات', href: '/dashboard/settings' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-64 bg-white border-l shadow-xl transform transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Menu */}
        <nav className="mt-16 lg:mt-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = 
              pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0066CC] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}