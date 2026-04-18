// src/app/admin/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ADMIN KENG | STOCK',
  description: 'ระบบจัดการคลังสินค้าหลังบ้าน',
  // เพิ่มส่วน icons ตรงนี้ครับ 👇
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💠</text></svg>',
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section>{children}</section>
}