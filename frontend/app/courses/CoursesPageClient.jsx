'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Button from '../../components/Button'
import { apiRequest } from '../../lib/api'

function formatPrice(price, isFree) {
  if (isFree || Number(price) === 0) return 'Miễn phí'
  return `${Number(price).toLocaleString('vi-VN')}đ`
}

function renderStars(ratingAvg) {
  const rating = Number(ratingAvg || 0)
  const fullStars = Math.round(rating)
  return '★'.repeat(fullStars) + '☆'.repeat(Math.max(0, 5 - fullStars))
}

function CourseCard({ course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="aspect-[16/10] bg-slate-100">
        {course.coverImageUrl ? (
          <img
            src={course.coverImageUrl}
            alt={course.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-medium text-slate-500">
            Chưa có ảnh bìa
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {course.category?.name || 'Khóa học'}
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {formatPrice(course.price, course.isFree)}
          </span>
        </div>

        <div>
          <h3 className="line-clamp-2 text-lg font-bold text-slate-900">{course.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {course.shortDescription || 'Khóa học đang được cập nhật mô tả.'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
          <span className="truncate">{course.instructor?.fullName || 'Đang cập nhật'}</span>
          <span className="whitespace-nowrap text-amber-500">
            {renderStars(course.ratingAvg)} ({course.ratingCount || 0})
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function CoursesPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 9, totalItems: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filters = useMemo(
    () => ({
      keyword: searchParams.get('keyword') || '',
      categoryId: searchParams.get('categoryId') || '',
      priceType: searchParams.get('priceType') || '',
      page: Number(searchParams.get('page') || 1),
    }),
    [searchParams]
  )

  const updateQuery = (nextValues) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 1) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })

    const query = params.toString()
    router.push(query ? `/courses?${query}` : '/courses')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [categoriesRes, coursesRes] = await Promise.all([
          apiRequest('/courses/categories'),
          apiRequest(
            `/courses?keyword=${encodeURIComponent(filters.keyword)}&categoryId=${filters.categoryId}&priceType=${filters.priceType}&page=${filters.page}&limit=9`
          ),
        ])

        setCategories(categoriesRes.data)
        setCourses(coursesRes.data.items)
        setPagination(coursesRes.data.pagination)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Khám phá các khóa học công khai</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Lọc theo danh mục, loại giá và chọn khóa học phù hợp để bắt đầu ngay.
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Danh mục</label>
          <select
            value={filters.categoryId}
            onChange={(e) => updateQuery({ categoryId: e.target.value, page: 1 })}
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

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Giá</label>
          <select
            value={filters.priceType}
            onChange={(e) => updateQuery({ priceType: e.target.value, page: 1 })}
            className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Tất cả</option>
            <option value="free">Miễn phí</option>
            <option value="paid">Trả phí</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button variant="outline" className="w-full" onClick={() => router.push('/courses')}>
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Đang tải danh sách khóa học...
        </div>
      ) : error ? (
        <div className="rounded-[28px] bg-red-50 p-6 text-red-600">{error}</div>
      ) : courses.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Không tìm thấy khóa học phù hợp.
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between text-sm text-slate-600">
            <span>Hiển thị {courses.length} khóa học</span>
            <span>Tổng {pagination.totalItems} khóa học</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => updateQuery({ page: pagination.page - 1 })}
            >
              Trang trước
            </Button>

            <div className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              Trang {pagination.page} / {pagination.totalPages}
            </div>

            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateQuery({ page: pagination.page + 1 })}
            >
              Trang sau
            </Button>
          </div>
        </>
      )}
    </section>
  )
}