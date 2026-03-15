import Link from 'next/link'
import Button from '../components/Button'

export default function HomePage() {
  return (
    <section className="page-container section-spacing">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="hero-badge mb-4">Nền tảng E-Learning</p>

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

        <div className="surface-card p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="stats-box">
              <p className="text-sm text-slate-500">Khóa học</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">120+</p>
            </div>

            <div className="stats-box">
              <p className="text-sm text-slate-500">Học viên</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">10.000+</p>
            </div>

            <div className="stats-box">
              <p className="text-sm text-slate-500">Giảng viên</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">30+</p>
            </div>

            <div className="stats-box">
              <p className="text-sm text-slate-500">Tỷ lệ hoàn thành</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">89%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}