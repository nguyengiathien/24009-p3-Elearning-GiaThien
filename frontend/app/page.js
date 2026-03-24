import Link from 'next/link'
import Button from '../components/Button'

export default function HomePage() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10 mb-4">Nền tảng E-Learning</p>

          <h1 className="mb-5 text-4xl font-bold tracking-tight text-slate-900 lg:text-6xl">
            Học trực tuyến dễ dàng, quản lý đào tạo tập trung
          </h1>

          <p className="mb-8 max-w-2xl text-base leading-8 text-slate-600 lg:text-lg">
            Khám phá khóa học, theo dõi tiến độ, làm bài kiểm tra và quản trị nội dung đào tạo trên
            cùng một hệ thống hiện đại và trực quan.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/courses">
              <Button>Xem khóa học</Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline">Bắt đầu ngay</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-xl ring-1 ring-slate-200/50 p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-100">
              <p className="text-sm text-slate-500">Khóa học</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">120+</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-100">
              <p className="text-sm text-slate-500">Học viên</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">10.000+</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-100">
              <p className="text-sm text-slate-500">Giảng viên</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">30+</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-100">
              <p className="text-sm text-slate-500">Tỷ lệ hoàn thành</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">89%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}