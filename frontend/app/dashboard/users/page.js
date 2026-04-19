'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../../components/Button'
import { apiRequest, getStoredUser } from '../../../lib/api'

export default function AdminUsersPage() {
  const router = useRouter()

  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  })
  const [filters, setFilters] = useState({
    keyword: '',
    roleId: '',
    status: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getStoredUser()

    if (!user) {
      router.replace('/auth?redirect=/dashboard/users')
      return
    }

    if (user.role !== 'admin') {
      router.replace('/')
      return
    }

    setAuthorized(true)
  }, [router])

  const fetchRoles = async () => {
    const res = await apiRequest('/admin/roles')
    setRoles(res.data)
  }

  const fetchUsers = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true)
      setError('')

      const query = new URLSearchParams({
        page: String(page),
        limit: '10',
      })

      if (currentFilters.keyword) query.set('keyword', currentFilters.keyword)
      if (currentFilters.roleId) query.set('roleId', currentFilters.roleId)
      if (currentFilters.status) query.set('status', currentFilters.status)

      const res = await apiRequest(`/admin/users?${query.toString()}`)
      setUsers(res.data.items)
      setPagination(res.data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authorized) return

    Promise.all([fetchRoles(), fetchUsers(1)])
  }, [authorized])

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers(1, filters)
  }

  const handleResetFilters = () => {
    const nextFilters = {
      keyword: '',
      roleId: '',
      status: '',
    }
    setFilters(nextFilters)
    fetchUsers(1, nextFilters)
  }

  const handleChangeStatus = async (user) => {
    const nextStatus = user.status === 'locked' ? 'active' : 'locked'
    const label = nextStatus === 'locked' ? 'khóa' : 'mở khóa'

    const confirmed = window.confirm(`Bạn có chắc muốn ${label} tài khoản này?`)
    if (!confirmed) return

    try {
      setMessage('')
      setError('')

      await apiRequest(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })

      setMessage(`Đã ${label} tài khoản thành công`)
      fetchUsers(pagination.page)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleResetPassword = async (user) => {
    const manualPassword = window.prompt(
      `Nhập mật khẩu mới cho ${user.fullName}.\nĐể trống rồi bấm OK để hệ thống tự tạo mật khẩu tạm.`
    )

    if (manualPassword === null) return

    try {
      setMessage('')
      setError('')

      const payload = manualPassword.trim()
        ? { password: manualPassword.trim() }
        : {}

      const res = await apiRequest(`/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const tempPassword = res.data.temporaryPassword
      window.alert(`Đặt lại mật khẩu thành công.\nMật khẩu mới: ${tempPassword}`)
      setMessage('Đặt lại mật khẩu thành công')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!authorized) return null

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
         
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Quản lý tài khoản toàn hệ thống
          </h1>
        </div>

        <Link href="/dashboard/users/new">
          <Button>Thêm người dùng mới</Button>
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-6 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4"
      >
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Từ khóa</label>
          <input
            name="keyword"
            value={filters.keyword}
            onChange={handleFilterChange}
            placeholder="Tìm theo họ tên, email, số điện thoại"
            className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Vai trò</label>
          <select
            name="roleId"
            value={filters.roleId}
            onChange={handleFilterChange}
            className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Tất cả vai trò</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            
          </select>
        </div>

        <div className="md:col-span-4 flex flex-wrap gap-3">
          <Button type="submit">Lọc</Button>
          <Button type="button" variant="outline" onClick={handleResetFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      </form>

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

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-5 py-4 font-semibold">Người dùng</th>
                <th className="px-5 py-4 font-semibold">Vai trò</th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 font-semibold">Tạo lúc</th>
                <th className="px-5 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                    Không có người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{user.fullName}</p>
                        <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                        <p className="mt-1 text-sm text-slate-500">{user.phone || 'Chưa có số điện thoại'}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {user.roleName || user.role}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : user.status === 'locked'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleString('vi-VN')}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link href={`/dashboard/users/${user.id}`}>
                          <Button variant="outline">Sửa</Button>
                        </Link>

                        <Button variant="outline" onClick={() => handleChangeStatus(user)}>
                          {user.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                        </Button>

                        <Button variant="outline" onClick={() => handleResetPassword(user)}>
                          Đặt lại mật khẩu
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">Tổng {pagination.totalItems} người dùng</p>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
            >
              Trang trước
            </Button>

            <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              Trang {pagination.page} / {pagination.totalPages}
            </div>

            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}