'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CourseManageForm from '../../../../components/CourseManageForm'
import { getStoredUser } from '../../../../lib/api'

export default function CreateCoursePage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const user = getStoredUser()

    if (!user) {
      router.replace('/auth?redirect=/dashboard/courses/new')
      return
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      router.replace('/')
      return
    }

    setAuthorized(true)
  }, [router])

  if (!authorized) return null

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
          A.10 Tạo khóa học
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Tạo khóa học mới
        </h1>
      </div>

      <CourseManageForm />
    </section>
  )
}