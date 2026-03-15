import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'E-Learning System',
  description: 'Nền tảng đào tạo trực tuyến',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}