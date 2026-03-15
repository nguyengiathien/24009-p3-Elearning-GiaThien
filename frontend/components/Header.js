'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiRequest, clearAuth, getStoredUser } from '../lib/api'
import Button from './Button'

export default function Header() {
  const [user, setUser] = useState(null)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      setUser(storedUser)
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    apiRequest('/auth/me')
      .then((res) => {
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
      })
      .catch(() => {
        clearAuth()
        setUser(null)
      })
  }, [])

  const handleLogout = () => {
    clearAuth()
    setUser(null)
    window.location.href = '/'
  }

  const handleSearch = (e) => {
    e.preventDefault()
    window.location.href = `/courses?keyword=${encodeURIComponent(keyword)}`
  }

  const canAccessDashboard = user?.role === 'admin' || user?.role === 'instructor'

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="page-container flex items-center gap-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
          E-Learning
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 md:block">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm khóa học..."
            className="form-input"
          />
        </form>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Trang chủ
          </Link>
          <Link href="/courses" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Khóa học
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!user ? (
            <>
              <Link href="/auth">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link href="/auth">
                <Button>Đăng ký</Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm shadow-sm transition hover:bg-slate-50">
                🔔
              </button>

              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {user.avatarUrl ? (
                      <img
                        src={`http://localhost:5000${user.avatarUrl}`}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.fullName?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="hidden max-w-[140px] truncate text-sm font-semibold text-slate-800 md:inline">
                    {user.fullName}
                  </span>
                </summary>

                <div className="absolute right-0 mt-3 w-60 rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
                  <Link href="/profile" className="block rounded-2xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                    Trang cá nhân
                  </Link>
                  <Link href="/my-courses" className="block rounded-2xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                    Khóa học của tôi
                  </Link>
                  {canAccessDashboard && (
                    <Link href="/dashboard" className="block rounded-2xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                      Trang quản trị
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}