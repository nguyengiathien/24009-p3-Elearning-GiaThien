import { Suspense } from 'react'
import CoursesPageClient from './CoursesPageClient'

function CoursesFallback() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Đang tải danh sách khóa học...
      </div>
    </section>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<CoursesFallback />}>
      <CoursesPageClient />
    </Suspense>
  )
}