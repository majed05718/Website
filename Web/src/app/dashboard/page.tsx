'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Header } from '@/components/dashboard/Header'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, CheckCircle, Users, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data
const statsData = [
  {
    title: 'إجمالي العقارات',
    value: '156',
    change: '+12%',
    trend: 'up',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'المعاينات اليوم',
    value: '24',
    change: '+8%',
    trend: 'up',
    icon: Calendar,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'العقارات النشطة',
    value: '89',
    change: '-3%',
    trend: 'down',
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'العملاء الجدد',
    value: '42',
    change: '+15%',
    trend: 'up',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
]

const chartData = [
  { name: 'يناير', مبيعات: 12 },
  { name: 'فبراير', مبيعات: 19 },
  { name: 'مارس', مبيعات: 15 },
  { name: 'أبريل', مبيعات: 25 },
  { name: 'مايو', مبيعات: 22 },
  { name: 'يونيو', مبيعات: 30 },
]

const recentProperties = [
  { id: 1, title: 'شقة فاخرة في الرياض', price: '850,000', city: 'الرياض', status: 'متاح', date: '2024-01-15' },
  { id: 2, title: 'فيلا مع مسبح', price: '1,200,000', city: 'جدة', status: 'محجوز', date: '2024-01-14' },
  { id: 3, title: 'أرض تجارية', price: '2,500,000', city: 'الدمام', status: 'متاح', date: '2024-01-13' },
  { id: 4, title: 'محل تجاري', price: '450,000', city: 'الرياض', status: 'مباع', date: '2024-01-12' },
]

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated()) {
    return null
  }

  return ( {/*
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar }
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content }
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          Welcome */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              مرحباً، {user?.name} 👋
            </h2>
            <p className="text-gray-600 mt-1">إليك ملخص نشاطك اليوم</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon
              const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
              
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <Badge
                        variant={stat.trend === 'up' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        <TrendIcon className="h-3 w-3" />
                        {stat.change}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Sales Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>المبيعات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="مبيعات" stroke="#0066CC" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>أحدث الأنشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">معاينة عقار جديدة</p>
                        <p className="text-xs text-gray-500">منذ {i} ساعات</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle>أحدث العقارات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-right">
                      <th className="pb-3 text-sm font-semibold text-gray-600">العنوان</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">السعر</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">المدينة</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">الحالة</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProperties.map((property) => (
                      <tr key={property.id} className="border-b last:border-0">
                        <td className="py-4 text-sm font-medium text-gray-900">{property.title}</td>
                        <td className="py-4 text-sm text-gray-600">{property.price} ر.س</td>
                        <td className="py-4 text-sm text-gray-600">{property.city}</td>
                        <td className="py-4">
                          <Badge
                            variant={
                              property.status === 'متاح'
                                ? 'default'
                                : property.status === 'محجوز'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {property.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-gray-600">{property.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>{/*
        </main>
      </div>
    </div>*/}
  )
}
