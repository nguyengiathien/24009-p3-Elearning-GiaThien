'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AvatarUpload from '../../components/AvatarUpload'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { apiRequest } from '../../lib/api'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    email: '',
    avatarUrl: '',
    role: '',
  })

  useEffect(() => {
    apiRequest('/users/profile')
      .then((res) => {
        setProfile({
          fullName: res.data.fullName || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          avatarUrl: res.data.avatarUrl || '',
          role: res.data.role || '',
        })
      })
      .catch(() => {
        router.push('/auth')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setMessage('')

      const res = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: profile.fullName,
          phone: profile.phone,
        }),
      })

      setMessage(res.message)
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">Đang tải...</div>
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.10)] sm:p-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Trang cá nhân</h1>
        <p className="mb-8 text-sm leading-6 text-slate-500">
          Cập nhật thông tin cá nhân và ảnh đại diện của bạn.
        </p>

        <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
          <AvatarUpload
            currentAvatar={profile.avatarUrl}
            onUploaded={(avatarUrl) => {
              const updated = { ...profile, avatarUrl }
              setProfile(updated)
              localStorage.setItem('user', JSON.stringify(updated))
            }}
          />
        </div>

        {message && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200 mb-5">{message}</div>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Họ và tên"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
          />

          <Input label="Số điện thoại" name="phone" value={profile.phone} onChange={handleChange} />

          <Input label="Email" value={profile.email} disabled className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 bg-slate-100 text-slate-500 opacity-70 cursor-not-allowed sm:text-sm sm:leading-6" />

          <Input label="Vai trò" value={profile.role} disabled className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 bg-slate-100 text-slate-500 opacity-70 cursor-not-allowed sm:text-sm sm:leading-6" />

          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </form>
      </div>
    </section>
  )
}