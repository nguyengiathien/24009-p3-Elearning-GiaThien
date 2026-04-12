'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../../components/Button'
import { apiRequest, getStoredUser } from '../../../lib/api'

export default function ManageCoursesPage() {
  const router = useRouter()

  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  })
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    categoryId: '',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const user = getStoredUser()

    if (!user) {
      router.replace('/auth?redirect=/dashboard/courses')
      return
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      router.replace('/')
      return
    }

    setAuthorized(true)
  }, [router])

  const fetchCourses = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      })

      if (currentFilters.keyword) params.set('keyword', currentFilters.keyword)
      if (currentFilters.status) params.set('status', currentFilters.status)
      if (currentFilters.categoryId) params.set('categoryId', currentFilters.categoryId)

      const res = await apiRequest(`/manage/courses?${params.toString()}`)
      setCourses(res.data.items)
      setPagination(res.data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const res = await apiRequest('/courses/categories')
    setCategories(res.data)
  }

  useEffect(() => {
    if (!authorized) return
    Promise.all([fetchCourses(1), fetchCategories()])
  }, [authorized])

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourses(1, filters)
  }

  const handleResetFilters = () => {
    const next = { keyword: '', status: '', categoryId: '' }
    setFilters(next)
    fetchCourses(1, next)
  }

  const handleToggleStatus = async (course) => {
    const nextStatus = course.status === 'public' ? 'draft' : 'public'

    try {
      setError('')
      setMessage('')

      await apiRequest(`/manage/courses/${course.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })

      setMessage('Cập nhật trạng thái khóa học thành công')
      fetchCourses(pagination.page)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!authorized) return null

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            A.10 Quản lý khóa học
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Danh sách khóa học quản trị
          </h1>
        </div>

        <Link href="/dashboard/courses/new">
          <Button>Tạo khóa học mới</Button>
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
            placeholder="Tìm theo tên khóa học"
            className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Tất cả</option>
            <option value="draft">Draft</option>
            <option value="public">Public</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Danh mục</label>
          <select
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
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

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Đang tải danh sách khóa học...
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Chưa có khóa học nào phù hợp.
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">{course.title}</h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        course.status === 'public'
                          ? 'bg-emerald-50 text-emerald-600'
                          : course.status === 'draft'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">{course.slug}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {course.shortDescription || 'Chưa có mô tả ngắn'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span>Danh mục: {course.category?.name || 'Chưa chọn'}</span>
                    <span>Giá: {course.isFree ? 'Miễn phí' : `${Number(course.price).toLocaleString('vi-VN')}đ`}</span>
                    <span>GV: {course.instructor?.fullName || 'Chưa có'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                  <Button variant="outline" onClick={() => handleToggleStatus(course)}>
                    {course.status === 'public' ? 'Chuyển về Draft' : 'Chuyển Public'}
                  </Button>

                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button variant="outline">Sửa thông tin</Button>
                  </Link>

                  <Link href={`/dashboard/courses/${course.id}/editor`}>
                    <Button variant="outline">Biên soạn nội dung</Button>
                  </Link>

                  <Link href={`/dashboard/courses/${course.id}/students`}>
                    <Button variant="outline">Quản lý học viên</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Tổng {pagination.totalItems} khóa học
        </p>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => fetchCourses(pagination.page - 1)}
          >
            Trang trước
          </Button>

          <div className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
            Trang {pagination.page} / {pagination.totalPages}
          </div>

          <Button
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchCourses(pagination.page + 1)}
          >
            Trang sau
          </Button>
        </div>
      </div>
    </section>
  )
}