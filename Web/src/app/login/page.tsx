'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Phone, Lock, Home } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

const loginSchema = z.object({
  phone: z.string().regex(/^5[0-9]{8}$/, 'رقم الجوال يجب أن يبدأ بـ 5 ويتكون من 9 أرقام'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      // ⚠️ Development only - skip API validation
      const mockUser = {
        id: 'dev-user-123',
        name: 'مستخدم تجريبي',
        phone: data.phone,
        role: 'manager',
        officeId: 'dev-office-456'
      }
      const mockToken = 'dev-token-' + Date.now()

      // Save to Zustand store
      setAuth(mockUser, mockToken)

      // Save to cookie for middleware
      if (typeof window !== 'undefined') {
        document.cookie = `auth_token=${mockToken}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      }

      toast.success('تم تسجيل الدخول بنجاح')
      router.push('/dashboard')
    } catch (error) {
      toast.error('حدث خطأ في تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4" dir="rtl">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            نظام إدارة العقارات
          </h1>
          <p className="text-gray-600">
            مرحباً بك! سجل دخولك للمتابعة
          </p>
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ وضع التطوير: أدخل أي بيانات صحيحة
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الجوال
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">966+</span>
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="501234567"
                  className="w-full pr-24 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  className="w-full pr-12 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          جميع الحقوق محفوظة © 2025
        </p>
      </div>
    </div>
  )
}
