'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '../../../../../components/Button'
import { apiRequest, getStoredUser } from '../../../../../lib/api'

export default function CourseStudentsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id

  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getStoredUser()

    if (!user) {
      router.replace(`/auth?redirect=/dashboard/courses/${courseId}/students`)
      return
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      router.replace('/')
      return
    }

    setAuthorized(true)
  }, [router, courseId])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await apiRequest(`/manage/courses/${courseId}/enrollments`)
      setCourse(res.data.course)
      setStudents(res.data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authorized) {
      fetchEnrollments()
    }
  }, [authorized])

  const handleAddStudent = async (e) => {
    e.preventDefault()

    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/courses/${courseId}/enrollments`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      setMessage('Thêm học viên vào khóa học thành công')
      setEmail('')
      fetchEnrollments()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemoveStudent = async (enrollmentId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa học viên khỏi khóa học này?')
    if (!confirmed) return

    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/courses/${courseId}/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      })

      setMessage('Đã xóa học viên khỏi khóa học')
      fetchEnrollments()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!authorized) return null

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {course?.title || 'Quản lý học viên'}
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
        onSubmit={handleAddStudent}
        className="mb-6 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_auto]"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Thêm học viên bằng email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-end">
          <Button type="submit">Thêm học viên</Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-5 py-4 font-semibold">Học viên</th>
                <th className="px-5 py-4 font-semibold">Vai trò</th>
                <th className="px-5 py-4 font-semibold">Tiến độ</th>
                <th className="px-5 py-4 font-semibold">Ngày ghi danh</th>
                <th className="px-5 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                    Đang tải danh sách học viên...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                    Chưa có học viên nào trong khóa học.
                  </td>
                </tr>
              ) : (
                students.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.user?.fullName}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.user?.email}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.user?.phone || 'Chưa có số điện thoại'}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {item.user?.roleName || item.user?.role || 'student'}
                    </td>

                    <td className="px-5 py-4">
                      <div className="w-40">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-600">Hoàn thành</span>
                          <span className="font-semibold text-slate-900">
                            {Number(item.progressPercent || 0).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${Math.min(100, Number(item.progressPercent || 0))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.enrolledAt ? new Date(item.enrolledAt).toLocaleString('vi-VN') : '—'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveStudent(item.id)}
                      >
                        Xóa khỏi khóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push('/dashboard/courses')}>
          Quay lại quản lý khóa học
        </Button>
      </div>
    </section>
  )
}