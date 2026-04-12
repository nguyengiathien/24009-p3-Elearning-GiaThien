import { Suspense } from 'react'
import AuthPageClient from './AuthPageClient'

function AuthPageFallback() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex min-h-[calc(100vh-180px)] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-[32px] border border-white/60 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <p className="text-slate-600 font-medium">Đang tải trang đăng nhập...</p>
      </div>
    </section>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageClient />
    </Suspense>
  )
}