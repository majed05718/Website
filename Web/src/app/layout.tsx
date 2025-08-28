// web/src/app/layout.tsx (صحيح مع Providers)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'نظام إدارة العقارات',
  description: 'منصة شاملة لإدارة العقارات والمستأجرين',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
