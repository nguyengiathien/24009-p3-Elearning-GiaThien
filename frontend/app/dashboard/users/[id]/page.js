'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '../../../../components/Button'
import Input from '../../../../components/Input'
import { apiRequest, getStoredUser } from '../../../../lib/api'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

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
  })

  useEffect(() => {
    const user = getStoredUser()

    if (!user) {
      router.replace(`/auth?redirect=/dashboard/users/${id}`)
      return
    }

    if (user.role !== 'admin') {
      router.replace('/')
      return
    }

    setAuthorized(true)
  }, [router, id])

  useEffect(() => {
    const fetchData = async () => {
      if (!authorized) return

      try {
        setLoading(true)
        setError('')

        const [rolesRes, userRes] = await Promise.all([
          apiRequest('/admin/roles'),
          apiRequest(`/admin/users/${id}`),
        ])

        setRoles(rolesRes.data)

        const user = userRes.data
        setForm({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          roleId: String(user.roleId || ''),
          status: user.status || 'active',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authorized, id])

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

      await apiRequest(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || null,
          roleId: Number(form.roleId),
          status: form.status,
        }),
      })

      setMessage('Cập nhật người dùng thành công')
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
          Đang tải dữ liệu người dùng...
        </div>
      </section>
    )
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Cập nhật thông tin người dùng
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
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Cập nhật'}
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