'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../components/Button'
import { getStoredUser } from '../../lib/api'

function DashboardCard({ title, desc, href, color = 'blue' }) {
  const colorMap = {
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-200',
    emerald: 'from-emerald-500/10 to-green-500/10 border-emerald-200',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-200',
    violet: 'from-violet-500/10 to-fuchsia-500/10 border-violet-200',
  }

  return (
    <Link
      href={href}
      className={`group rounded-[28px] border bg-gradient-to-br p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${colorMap[color]}`}
    >
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
      <div className="mt-5 text-sm font-semibold text-slate-800 group-hover:text-blue-600">
        Truy cập →
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const storedUser = getStoredUser()

    if (!storedUser) {
      router.replace('/auth?redirect=/dashboard')
      return
    }

    if (!['admin', 'instructor'].includes(storedUser.role)) {
      router.replace('/')
      return
    }

    setUser(storedUser)
    setAuthorized(true)
  }, [router])

  const cards = useMemo(() => {
    if (!user) return []

    const baseCards = [
      {
        title: 'Quản lý khóa học',
        desc: 'Tạo khóa học mới, sửa thông tin, đổi trạng thái Draft/Public, biên soạn nội dung và quản lý học viên trong khóa.',
        href: '/dashboard/courses',
        color: 'blue',
      },
    ]

    if (user.role === 'admin') {
      return [
        {
          title: 'Quản lý người dùng',
          desc: 'Xem danh sách tài khoản toàn hệ thống, thêm người dùng mới, chỉnh sửa thông tin, khóa tài khoản và đặt lại mật khẩu.',
          href: '/dashboard/users',
          color: 'emerald',
        },
        ...baseCards,
      ]
    }

    return baseCards
  }, [user])

  if (!authorized) return null

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
          Dashboard quản trị
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Xin chào, {user?.fullName}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          {user?.role === 'admin'
            ? 'Bạn đang ở khu quản trị dành cho Admin. Tại đây bạn có thể quản lý người dùng, khóa học và nội dung đào tạo trên toàn hệ thống.'
            : 'Bạn đang ở khu quản trị dành cho Giảng viên. Tại đây bạn có thể quản lý các khóa học của mình, biên soạn nội dung và theo dõi lớp học.'}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {user?.role === 'admin' && (
            <Link href="/dashboard/users">
              <Button variant="outline">Đi tới quản lý người dùng</Button>
            </Link>
          )}

          <Link href="/dashboard/courses">
            <Button>Đi tới quản lý khóa học</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <DashboardCard key={card.href} {...card} />
        ))}
      </div>
    </section>
  )
}