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
    return <div className="page-container py-10">Đang tải...</div>
  }

  return (
    <section className="page-container py-10">
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

        {message && <div className="form-message mb-5">{message}</div>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Họ và tên"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
          />

          <Input label="Số điện thoại" name="phone" value={profile.phone} onChange={handleChange} />

          <Input label="Email" value={profile.email} disabled className="form-input-disabled" />

          <Input label="Vai trò" value={profile.role} disabled className="form-input-disabled" />

          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </form>
      </div>
    </section>
  )
}