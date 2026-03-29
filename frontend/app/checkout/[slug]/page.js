'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import Button from '../../../components/Button'
import { apiRequest, getStoredUser } from '../../../lib/api'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const elementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0f172a',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#dc2626',
    },
  },
}

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString('vi-VN')}đ`
}

function StripePaymentForm({ summary, couponCode, onPaymentSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setMessage('Stripe chưa sẵn sàng')
      return
    }

    try {
      setSubmitting(true)
      setMessage('')

      const intentRes = await apiRequest('/orders/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({
          courseSlug: summary.course.slug,
          couponCode,
        }),
      })

      if (intentRes.data.enrolled) {
        onPaymentSuccess('Đăng ký khóa học thành công')
        router.push(`/learn/${summary.course.slug}`)
        return
      }

      const cardNumberElement = elements.getElement(CardNumberElement)

      const confirmResult = await stripe.confirmCardPayment(intentRes.data.clientSecret, {
        payment_method: {
          card: cardNumberElement,
        },
      })

      if (confirmResult.error) {
        setMessage(confirmResult.error.message || 'Thanh toán thất bại')
        return
      }

      const paymentIntentId = confirmResult.paymentIntent?.id
      if (!paymentIntentId) {
        setMessage('Không lấy được thông tin giao dịch')
        return
      }

      await apiRequest('/orders/confirm-payment', {
        method: 'POST',
        body: JSON.stringify({
          orderId: intentRes.data.orderId,
          paymentIntentId,
        }),
      })

      onPaymentSuccess('Thanh toán thành công, bạn đã được ghi danh vào khóa học')
      router.push(`/learn/${summary.course.slug}`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (Number(summary.finalPrice) === 0) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{message}</div>}
        <div className="rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
          Khóa học này có giá 0đ sau khi áp dụng ưu đãi. Nhấn thanh toán để ghi danh ngay.
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Thanh toán ngay'}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{message}</div>}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Số thẻ</label>
        <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-blue-600">
          <CardNumberElement options={elementOptions} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">MM / YY</label>
          <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-blue-600">
            <CardExpiryElement options={elementOptions} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">CVC</label>
          <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-blue-600">
            <CardCvcElement options={elementOptions} />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={submitting || !stripe}>
        {submitting ? 'Đang thanh toán...' : 'Thanh toán ngay'}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flashMessage, setFlashMessage] = useState('')

  const fetchSummary = async (couponCode = '') => {
    try {
      setLoading(true)
      setError('')
      const res = await apiRequest(`/orders/checkout/${slug}?couponCode=${encodeURIComponent(couponCode)}`)
      setSummary(res.data)
      setAppliedCoupon(couponCode)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const user = getStoredUser()
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent(`/checkout/${slug}`)}`)
      return
    }

    fetchSummary()
  }, [slug, router])

  const canRenderPayment = useMemo(() => {
    return summary && !loading && !error
  }, [summary, loading, error])

  const handleApplyCoupon = async () => {
    await fetchSummary(couponInput.trim())
  }

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Đang tải thông tin thanh toán...
        </div>
      </section>
    )
  }

  if (error || !summary) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-[32px] bg-red-50 p-6 text-red-600">{error || 'Không tải được thông tin thanh toán'}</div>
      </section>
    )
  }

  if (summary.isEnrolled) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-[32px] border border-emerald-200 bg-emerald-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-emerald-800">Bạn đã mua khóa học này</h1>
          <p className="mt-3 text-emerald-700">Hệ thống ghi nhận bạn đã được ghi danh trước đó.</p>
          <Button className="mt-6" onClick={() => router.push(`/learn/${summary.course.slug}`)}>
            Vào học ngay
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">A.5 Thanh toán trực tuyến</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Hoàn tất thanh toán khóa học</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="overflow-hidden rounded-[24px] bg-slate-50">
            {summary.course.coverImageUrl ? (
              <img src={summary.course.coverImageUrl} alt={summary.course.title} className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-slate-500">
                Chưa có ảnh bìa
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{summary.course.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{summary.course.shortDescription}</p>
          </div>

          <div className="space-y-3 rounded-[24px] bg-slate-50 p-5 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-4">
              <span>Giá gốc</span>
              <span>{formatPrice(summary.originalPrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Giảm giá</span>
              <span>-{formatPrice(summary.discountAmount)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
              <span>Thanh toán</span>
              <span>{formatPrice(summary.finalPrice)}</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Mã giảm giá</label>
            <div className="flex gap-3">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Nhập coupon"
                className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
              />
              <Button type="button" variant="outline" onClick={handleApplyCoupon}>
                Áp dụng
              </Button>
            </div>
            {appliedCoupon && (
              <p className="mt-2 text-sm text-emerald-600">Đã áp dụng mã: {appliedCoupon}</p>
            )}
          </div>
        </aside>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {flashMessage && (
            <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {flashMessage}
            </div>
          )}

          <h2 className="text-2xl font-bold text-slate-900">Thông tin thẻ thanh toán</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Dữ liệu thẻ được xử lý qua Stripe. Sau khi thanh toán thành công, hệ thống sẽ tự động ghi danh khóa học cho bạn.
          </p>

          {canRenderPayment && (
            <div className="mt-8">
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  summary={summary}
                  couponCode={appliedCoupon}
                  onPaymentSuccess={(message) => setFlashMessage(message)}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}