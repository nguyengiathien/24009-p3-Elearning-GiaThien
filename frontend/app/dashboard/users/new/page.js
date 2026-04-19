'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../../../components/Button'
import Input from '../../../../components/Input'
import { apiRequest, getStoredUser } from '../../../../lib/api'

export default function AdminUserCreatePage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [roles, setRoles] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    roleId: '',
    status: 'active',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const user = getStoredUser()

    if (!user) {
      router.replace('/auth?redirect=/dashboard/users/new')
      return
    }

    if (user.role !== 'admin') {
      router.replace('/')
      return
    }

    setAuthorized(true)
  }, [router])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const res = await apiRequest('/admin/roles')
        setRoles(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (authorized) {
      fetchRoles()
    }
  }, [authorized])

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setMessage('')
      setError('')

      if (form.password !== form.confirmPassword) {
        setError('Mật khẩu nhập lại không khớp')
        return
      }

      await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || null,
          roleId: Number(form.roleId),
          status: form.status,
          password: form.password,
        }),
      })

      setMessage('Tạo người dùng thành công')
      router.push('/dashboard/users')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!authorized) return null

  if (loading) {
    return (
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Đang tải dữ liệu...
        </div>
      </section>
    )
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
       
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Thêm người dùng mới
        </h1>
      </div>

      {message && (
        <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Họ tên"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          <Input
            label="Số điện thoại"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="0901234567"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">Vai trò</label>
            <select
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
              className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="">Chọn vai trò</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="active">Active</option>
              <option value="locked">Locked</option>
              
            </select>
          </div>

          <Input
            label="Mật khẩu"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Tối thiểu 6 ký tự"
          />

          <Input
            label="Nhập lại mật khẩu"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Tạo người dùng'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/users')}
          >
            Quay lại
          </Button>
        </div>
      </form>
    </section>
  )
}