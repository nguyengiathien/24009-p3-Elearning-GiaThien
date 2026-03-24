export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/70 bg-white/70 backdrop-blur">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 py-10 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-base font-bold text-slate-900">E-Learning</h3>
          <p className="text-sm leading-6 text-slate-600">
            Nền tảng đào tạo trực tuyến giúp học tập thuận tiện, hiện đại và hiệu quả hơn.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-base font-bold text-slate-900">Liên kết nhanh</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Trang chủ</li>
            <li>Khóa học</li>
            <li>Liên hệ</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-base font-bold text-slate-900">Mạng xã hội</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Facebook</li>
            <li>YouTube</li>
            <li>TikTok</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}