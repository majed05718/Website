'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Notifications Panel - لوحة الإشعارات
 * ═══════════════════════════════════════════════════════════════
 */
import { toast } from 'sonner';
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Calendar,
  Users,
  MessageCircle,
  Wrench,
  DollarSign,
  FileText,
  Building,
  X
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { Notification, NotificationType } from '@/types/notifications'

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => n.status === 'unread').length

  /**
   * الأيقونة حسب النوع
   */
  const getIcon = (type: NotificationType) => {
    const icons = {
      appointment: Calendar,
      customer: Users,
      whatsapp: MessageCircle,
      maintenance: Wrench,
      payment: DollarSign,
      contract: FileText,
      property: Building,
      system: Bell
    }
    return icons[type]
  }

  /**
   * اللون حسب النوع
   */
  const getColor = (type: NotificationType) => {
    const colors = {
      appointment: 'text-blue-600 bg-blue-100',
      customer: 'text-green-600 bg-green-100',
      whatsapp: 'text-emerald-600 bg-emerald-100',
      maintenance: 'text-orange-600 bg-orange-100',
      payment: 'text-purple-600 bg-purple-100',
      contract: 'text-indigo-600 bg-indigo-100',
      property: 'text-cyan-600 bg-cyan-100',
      system: 'text-gray-600 bg-gray-100'
    }
    return colors[type]
  }

  /**
   * تحديد كمقروء
   */
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n)
    )
  }

  /**
   * تحديد الكل كمقروء
   */
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, status: 'read' as const }))
    )
    toast.success('تم تحديد جميع الإشعارات كمقروءة')
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    تحديد الكل كمقروء
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getIcon(notification.type)
                  const color = getColor(notification.type)
                  
                  return (
                    <Link
                      key={notification.id}
                      href={notification.link || '#'}
                      onClick={() => {
                        markAsRead(notification.id)
                        setIsOpen(false)
                      }}
                      className={`block p-4 border-b hover:bg-gray-50 transition-colors ${
                        notification.status === 'unread' ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm mb-1 ${
                            notification.status === 'unread' ? 'font-semibold' : 'font-medium'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ar
                            })}
                          </p>
                        </div>

                        {/* Unread Dot */}
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </Link>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t text-center">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                عرض جميع الإشعارات
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'موعد جديد',
    message: 'لديك موعد مع أحمد محمد غداً الساعة 10:00 صباحاً',
    link: '/dashboard/appointments',
    status: 'unread',
    userId: 'user-1',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'whatsapp',
    title: 'رسالة واتساب جديدة',
    message: 'فاطمة علي: هل العقار ما زال متاحاً؟',
    link: '/dashboard/whatsapp',
    status: 'unread',
    userId: 'user-1',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'maintenance',
    title: 'طلب صيانة جديد',
    message: 'تم استلام طلب صيانة لعقار شقة 101 - برج النخيل',
    link: '/dashboard/maintenance',
    status: 'unread',
    userId: 'user-1',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    type: 'payment',
    title: 'دفعة مستحقة',
    message: 'دفعة بقيمة 5,000 ريال مستحقة غداً',
    link: '/dashboard/payments',
    status: 'read',
    userId: 'user-1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    type: 'customer',
    title: 'عميل جديد',
    message: 'تم إضافة عميل جديد: خالد السعيد',
    link: '/dashboard/customers',
    status: 'read',
    userId: 'user-1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
]
