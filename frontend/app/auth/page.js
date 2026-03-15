'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { apiRequest, saveAuth } from '../../lib/api'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
  }

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setMessage('')

      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      })

      saveAuth(res.data)

      if (res.data.user.role === 'admin' || res.data.user.role === 'instructor') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setMessage('')

      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      })

      saveAuth(res.data)
      router.push('/')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-container flex min-h-[calc(100vh-180px)] items-center justify-center py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/60 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.12)] lg:grid-cols-2">
        <div className="hidden bg-slate-900 p-10 text-white lg:block">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-slate-300">E-Learning Platform</p>
          <h2 className="mb-4 text-4xl font-bold leading-tight">Học tập linh hoạt, quản lý dễ dàng</h2>
          <p className="max-w-md text-base leading-7 text-slate-300">
            Đăng nhập để tiếp tục khóa học hoặc tạo tài khoản mới để bắt đầu hành trình học tập
            của bạn.
          </p>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {message && <div className="form-message mb-4">{message}</div>}

          {tab === 'login' ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={handleLoginChange}
              />
              <Input
                label="Mật khẩu"
                type="password"
                name="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={handleLoginChange}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegister}>
              <Input
                label="Họ tên"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={registerForm.fullName}
                onChange={handleRegisterChange}
              />
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={registerForm.email}
                onChange={handleRegisterChange}
              />
              <Input
                label="Mật khẩu"
                type="password"
                name="password"
                placeholder="••••••••"
                value={registerForm.password}
                onChange={handleRegisterChange}
              />
              <Input
                label="Nhập lại mật khẩu"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}