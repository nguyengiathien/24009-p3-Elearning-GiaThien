'use client'

import { useState } from 'react'
import Button from './Button'
import { apiRequest } from '../lib/api'

export default function AvatarUpload({ currentAvatar, onUploaded }) {
  const [preview, setPreview] = useState(currentAvatar || '')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Vui lòng chọn ảnh')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const formData = new FormData()
      formData.append('avatar', file)

      const res = await apiRequest('/users/profile/avatar', {
        method: 'PUT',
        body: formData,
      })

      setMessage('Tải ảnh thành công')
      if (onUploaded) onUploaded(res.data.avatarUrl)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-2xl font-semibold text-slate-600">
        {preview ? (
          <img
            src={preview.startsWith('blob:') ? preview : `http://localhost:5000${preview}`}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          'A'
        )}
      </div>

      <div className="space-y-3">
        <label className="inline-block cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Chọn ảnh
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </label>

        <div>
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? 'Đang tải...' : 'Tải ảnh lên'}
          </Button>
        </div>

        {message && <p className="text-sm text-slate-600">{message}</p>}
      </div>
    </div>
  )
}