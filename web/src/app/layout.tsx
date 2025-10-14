import './globals.css'
import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import { Toaster } from 'sonner'

const cairo = Cairo({ 
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'نظام إدارة العقارات',
  description: 'نظام شامل لإدارة العقارات والمكاتب العقارية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}