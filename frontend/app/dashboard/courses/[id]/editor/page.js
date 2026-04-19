'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '../../../../../components/Button'
import { apiRequest, getStoredUser } from '../../../../../lib/api'

const emptyQuestionForm = {
  questionText: '',
  sortOrder: 0,
  answers: [
    { answerText: '', isCorrect: true },
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
  ],
}

export default function CourseEditorPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id

  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [newSection, setNewSection] = useState({
    title: '',
    sortOrder: 0,
  })

  const [newLessonBySection, setNewLessonBySection] = useState({})
  const [quizFormByLesson, setQuizFormByLesson] = useState({})
  const [newQuestionByQuiz, setNewQuestionByQuiz] = useState({})

  useEffect(() => {
    const user = getStoredUser()

    if (!user) {
      router.replace(`/auth?redirect=/dashboard/courses/${courseId}/editor`)
      return
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      router.replace('/')
      return
    }

    setAuthorized(true)
  }, [router, courseId])

  const fetchEditorData = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await apiRequest(`/manage/courses/${courseId}/editor`)
      setCourse(res.data)

      const nextQuizForms = {}
      const nextQuestionForms = {}

      ;(res.data.sections || []).forEach((section) => {
        ;(section.lessons || []).forEach((lesson) => {
          if (lesson.lessonType === 'quiz') {
            nextQuizForms[lesson.id] = {
              title: lesson.quiz?.title || `${lesson.title} - Quiz`,
              passScore: lesson.quiz?.passScore || 80,
              timeLimitMinutes: lesson.quiz?.timeLimitMinutes || '',
            }

            if (lesson.quiz?.id) {
              nextQuestionForms[lesson.quiz.id] = { ...emptyQuestionForm }
            }
          }
        })
      })

      setQuizFormByLesson(nextQuizForms)
      setNewQuestionByQuiz(nextQuestionForms)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authorized) {
      fetchEditorData()
    }
  }, [authorized])

  const sectionCount = useMemo(() => course?.sections?.length || 0, [course])

  const getDefaultLessonForm = (sectionId, currentSection) => ({
    sectionId,
    title: '',
    lessonType: 'video',
    content: '',
    videoUrl: '',
    durationSeconds: '',
    isPreview: false,
    isPublished: true,
    unlockOrder: (currentSection?.lessons?.length || 0) + 1,
    sortOrder: (currentSection?.lessons?.length || 0) + 1,
  })

  const handleCreateSection = async (e) => {
    e.preventDefault()

    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/courses/${courseId}/sections`, {
        method: 'POST',
        body: JSON.stringify({
          title: newSection.title,
          sortOrder: Number(newSection.sortOrder || 0),
        }),
      })

      setMessage('Tạo chương học thành công')
      setNewSection({ title: '', sortOrder: sectionCount + 1 })
      fetchEditorData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdateSection = async (section) => {
    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/sections/${section.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: section.title,
          sortOrder: Number(section.sortOrder || 0),
        }),
      })

      setMessage('Cập nhật chương học thành công')
      fetchEditorData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteSection = async (sectionId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa chương học này?')
    if (!confirmed) return

    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/sections/${sectionId}`, {
        method: 'DELETE',
      })

      setMessage('Xóa chương học thành công')
      fetchEditorData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLessonFormChange = (sectionId, field, value, section) => {
    setNewLessonBySection((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || getDefaultLessonForm(sectionId, section)),
        [field]: value,
      },
    }))
  }

  const handleCreateLesson = async (sectionId, section) => {
    const form = newLessonBySection[sectionId] || getDefaultLessonForm(sectionId, section)

    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/courses/${courseId}/lessons`, {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          sectionId,
          durationSeconds: form.durationSeconds ? Number(form.durationSeconds) : null,
          unlockOrder: Number(form.unlockOrder || 0),
          sortOrder: Number(form.sortOrder || 0),
          isPreview: Boolean(form.isPreview),
          isPublished: Boolean(form.isPublished),
        }),
      })

      setMessage('Tạo bài học thành công')
      setNewLessonBySection((prev) => ({
        ...prev,
        [sectionId]: getDefaultLessonForm(sectionId, section),
      }))
      fetchEditorData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLessonFieldChange = (sectionId, lessonId, field, value) => {
    setCourse((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson.id !== lessonId ? lesson : { ...lesson, [field]: value }
              ),
            }
      ),
    }))
  }

  const handleUpdateLesson = async (lesson) => {
    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/lessons/${lesson.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...lesson,
          sectionId: Number(lesson.sectionId),
          durationSeconds: lesson.durationSeconds ? Number(lesson.durationSeconds) : null,
          unlockOrder: Number(lesson.unlockOrder || 0),
          sortOrder: Number(lesson.sortOrder || 0),
          isPreview: Boolean(lesson.isPreview),
          isPublished: Boolean(lesson.isPublished),
        }),
      })

      setMessage('Cập nhật bài học thành công')
      fetchEditorData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa bài học này?')
    if (!confirmed) return

    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/lessons/${lessonId}`, {
        method: 'DELETE',
      })

      setMessage('Xóa bài học thành công')
      fetchEditorData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleQuizFormChange = (lessonId, field, value) => {
    setQuizFormByLesson((prev) => ({
      ...prev,
      [lessonId]: {
        ...(prev[lessonId] || { title: '', passScore: 80, timeLimitMinutes: '' }),
        [field]: value,
      },
    }))
  }

  const handleSaveQuiz = async (lessonId) => {
    const form = quizFormByLesson[lessonId]

    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/lessons/${lessonId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          passScore: Number(form.passScore || 80),
          timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : null,
        }),
      })

      setMessage('Lưu quiz thành công')
      fetchEditorData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleQuestionFormChange = (quizId, field, value) => {
    setNewQuestionByQuiz((prev) => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || { ...emptyQuestionForm }),
        [field]: value,
      },
    }))
  }

  const handleAnswerChange = (quizId, index, field, value) => {
    setNewQuestionByQuiz((prev) => {
      const current = prev[quizId] || { ...emptyQuestionForm }
      const answers = current.answers.map((answer, answerIndex) =>
        answerIndex !== index
          ? answer
          : {
              ...answer,
              [field]: value,
            }
      )

      return {
        ...prev,
        [quizId]: {
          ...current,
          answers,
        },
      }
    })
  }

  const handleChooseCorrectAnswer = (quizId, index) => {
    setNewQuestionByQuiz((prev) => {
      const current = prev[quizId] || { ...emptyQuestionForm }

      return {
        ...prev,
        [quizId]: {
          ...current,
          answers: current.answers.map((answer, answerIndex) => ({
            ...answer,
            isCorrect: answerIndex === index,
          })),
        },
      }
    })
  }

  const handleCreateQuestion = async (quizId) => {
    const form = newQuestionByQuiz[quizId] || { ...emptyQuestionForm }

    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/quizzes/${quizId}/questions`, {
        method: 'POST',
        body: JSON.stringify({
          questionText: form.questionText,
          sortOrder: Number(form.sortOrder || 0),
          answers: form.answers,
        }),
      })

      setMessage('Thêm câu hỏi quiz thành công')
      setNewQuestionByQuiz((prev) => ({
        ...prev,
        [quizId]: { ...emptyQuestionForm },
      }))
      fetchEditorData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa câu hỏi này?')
    if (!confirmed) return

    try {
      setMessage('')
      setError('')

      await apiRequest(`/manage/questions/${questionId}`, {
        method: 'DELETE',
      })

      setMessage('Xóa câu hỏi thành công')
      fetchEditorData()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!authorized) return null

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
       
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {course?.title || 'Biên soạn khóa học'}
        </h1>
      </div>

      {message && (
        <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Đang tải dữ liệu biên soạn...
        </div>
      ) : (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateSection}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 text-xl font-bold text-slate-900">Tạo chương mới</h2>
            <div className="grid gap-4 md:grid-cols-[1fr_160px_auto]">
              <input
                value={newSection.title}
                onChange={(e) => setNewSection((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Tên chương học"
                className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="number"
                value={newSection.sortOrder}
                onChange={(e) => setNewSection((prev) => ({ ...prev, sortOrder: e.target.value }))}
                placeholder="Sort"
                className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
              />
              <Button type="submit">Thêm chương</Button>
            </div>
          </form>

          <div className="space-y-6">
            {(course?.sections || []).map((section, sectionIndex) => {
              const lessonForm =
                newLessonBySection[section.id] || getDefaultLessonForm(section.id, section)

              return (
                <div
                  key={section.id}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Chương {sectionIndex + 1}
                      </label>
                      <input
                        value={section.title}
                        onChange={(e) =>
                          setCourse((prev) => ({
                            ...prev,
                            sections: prev.sections.map((item) =>
                              item.id !== section.id ? item : { ...item, title: e.target.value }
                            ),
                          }))
                        }
                        className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="w-full md:w-40">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Sort</label>
                      <input
                        type="number"
                        value={section.sortOrder}
                        onChange={(e) =>
                          setCourse((prev) => ({
                            ...prev,
                            sections: prev.sections.map((item) =>
                              item.id !== section.id ? item : { ...item, sortOrder: e.target.value }
                            ),
                          }))
                        }
                        className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => handleUpdateSection(section)}>
                        Lưu chương
                      </Button>
                      <Button type="button" variant="outline" onClick={() => handleDeleteSection(section.id)}>
                        Xóa chương
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">Thêm bài học</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={lessonForm.title}
                        onChange={(e) => handleLessonFormChange(section.id, 'title', e.target.value, section)}
                        placeholder="Tên bài học"
                        className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                      />

                      <select
                        value={lessonForm.lessonType}
                        onChange={(e) => handleLessonFormChange(section.id, 'lessonType', e.target.value, section)}
                        className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="quiz">Quiz</option>
                      </select>

                      <input
                        value={lessonForm.videoUrl}
                        onChange={(e) => handleLessonFormChange(section.id, 'videoUrl', e.target.value, section)}
                        placeholder="Youtube embed / video URL"
                        className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                      />

                      <input
                        type="number"
                        value={lessonForm.durationSeconds}
                        onChange={(e) => handleLessonFormChange(section.id, 'durationSeconds', e.target.value, section)}
                        placeholder="Thời lượng (giây)"
                        className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                      />

                      <input
                        type="number"
                        value={lessonForm.sortOrder}
                        onChange={(e) => handleLessonFormChange(section.id, 'sortOrder', e.target.value, section)}
                        placeholder="Sort order"
                        className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                      />

                      <input
                        type="number"
                        value={lessonForm.unlockOrder}
                        onChange={(e) => handleLessonFormChange(section.id, 'unlockOrder', e.target.value, section)}
                        placeholder="Unlock order"
                        className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                      />

                      <label className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200">
                        <input
                          type="checkbox"
                          checked={lessonForm.isPreview}
                          onChange={(e) => handleLessonFormChange(section.id, 'isPreview', e.target.checked, section)}
                        />
                        Cho phép học thử
                      </label>

                      <label className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200">
                        <input
                          type="checkbox"
                          checked={lessonForm.isPublished}
                          onChange={(e) => handleLessonFormChange(section.id, 'isPublished', e.target.checked, section)}
                        />
                        Đã xuất bản
                      </label>

                      <div className="md:col-span-2">
                        <textarea
                          value={lessonForm.content}
                          onChange={(e) => handleLessonFormChange(section.id, 'content', e.target.value, section)}
                          rows={4}
                          placeholder="Nội dung bài học / tài liệu"
                          className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button type="button" onClick={() => handleCreateLesson(section.id, section)}>
                        Thêm bài học
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {(section.lessons || []).map((lesson) => {
                      const quizForm = quizFormByLesson[lesson.id] || {
                        title: `${lesson.title} - Quiz`,
                        passScore: 80,
                        timeLimitMinutes: '',
                      }

                      const questionForm = lesson.quiz?.id
                        ? newQuestionByQuiz[lesson.quiz.id] || { ...emptyQuestionForm }
                        : { ...emptyQuestionForm }

                      return (
                        <div key={lesson.id} className="rounded-[24px] border border-slate-200 p-4">
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h4 className="text-lg font-semibold text-slate-900">
                              Bài: {lesson.title}
                            </h4>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" onClick={() => handleUpdateLesson(lesson)}>
                                Lưu bài
                              </Button>
                              <Button type="button" variant="outline" onClick={() => handleDeleteLesson(lesson.id)}>
                                Xóa bài
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <input
                              value={lesson.title}
                              onChange={(e) => handleLessonFieldChange(section.id, lesson.id, 'title', e.target.value)}
                              placeholder="Tên bài học"
                              className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                            />

                            <select
                              value={lesson.lessonType}
                              onChange={(e) => handleLessonFieldChange(section.id, lesson.id, 'lessonType', e.target.value)}
                              className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                            >
                              <option value="video">Video</option>
                              <option value="document">Document</option>
                              <option value="quiz">Quiz</option>
                            </select>

                            <input
                              value={lesson.videoUrl || ''}
                              onChange={(e) => handleLessonFieldChange(section.id, lesson.id, 'videoUrl', e.target.value)}
                              placeholder="Youtube embed / video URL"
                              className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                            />

                            <input
                              type="number"
                              value={lesson.durationSeconds || ''}
                              onChange={(e) => handleLessonFieldChange(section.id, lesson.id, 'durationSeconds', e.target.value)}
                              placeholder="Thời lượng (giây)"
                              className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                            />

                            <input
                              type="number"
                              value={lesson.sortOrder}
                              onChange={(e) => handleLessonFieldChange(section.id, lesson.id, 'sortOrder', e.target.value)}
                              placeholder="Sort order"
                              className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                            />

                            <input
                              type="number"
                              value={lesson.unlockOrder}
                              onChange={(e) => handleLessonFieldChange(section.id, lesson.id, 'unlockOrder', e.target.value)}
                              placeholder="Unlock order"
                              className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                            />

                            <label className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={Boolean(lesson.isPreview)}
                                onChange={(e) => handleLessonFieldChange(section.id, lesson.id, 'isPreview', e.target.checked)}
                              />
                              Cho phép học thử
                            </label>

                            <label className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={Boolean(lesson.isPublished)}
                                onChange={(e) => handleLessonFieldChange(section.id, lesson.id, 'isPublished', e.target.checked)}
                              />
                              Đã xuất bản
                            </label>

                            <div className="md:col-span-2">
                              <textarea
                                value={lesson.content || ''}
                                onChange={(e) => handleLessonFieldChange(section.id, lesson.id, 'content', e.target.value)}
                                rows={4}
                                placeholder="Nội dung bài học"
                                className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                              />
                            </div>
                          </div>

                          {lesson.lessonType === 'quiz' && (
                            <div className="mt-5 rounded-[20px] bg-slate-50 p-4">
                              <h5 className="mb-4 text-lg font-semibold text-slate-900">Thiết lập quiz</h5>

                              <div className="grid gap-4 md:grid-cols-3">
                                <input
                                  value={quizForm.title}
                                  onChange={(e) => handleQuizFormChange(lesson.id, 'title', e.target.value)}
                                  placeholder="Tiêu đề quiz"
                                  className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                                />
                                <input
                                  type="number"
                                  value={quizForm.passScore}
                                  onChange={(e) => handleQuizFormChange(lesson.id, 'passScore', e.target.value)}
                                  placeholder="Điểm đạt"
                                  className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                                />
                                <input
                                  type="number"
                                  value={quizForm.timeLimitMinutes}
                                  onChange={(e) => handleQuizFormChange(lesson.id, 'timeLimitMinutes', e.target.value)}
                                  placeholder="Thời gian (phút)"
                                  className="block w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                                />
                              </div>

                              <div className="mt-4">
                                <Button type="button" onClick={() => handleSaveQuiz(lesson.id)}>
                                  Lưu quiz
                                </Button>
                              </div>

                              {lesson.quiz?.id && (
                                <div className="mt-6 space-y-4">
                                  <div className="rounded-[20px] bg-white p-4">
                                    <h6 className="mb-4 text-base font-semibold text-slate-900">
                                      Thêm câu hỏi
                                    </h6>

                                    <div className="space-y-4">
                                      <input
                                        value={questionForm.questionText}
                                        onChange={(e) => handleQuestionFormChange(lesson.quiz.id, 'questionText', e.target.value)}
                                        placeholder="Nội dung câu hỏi"
                                        className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                                      />

                                      <input
                                        type="number"
                                        value={questionForm.sortOrder}
                                        onChange={(e) => handleQuestionFormChange(lesson.quiz.id, 'sortOrder', e.target.value)}
                                        placeholder="Sort order"
                                        className="block w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                                      />

                                      <div className="grid gap-3 md:grid-cols-2">
                                        {questionForm.answers.map((answer, index) => (
                                          <div key={index} className="rounded-2xl bg-slate-50 p-3">
                                            <input
                                              value={answer.answerText}
                                              onChange={(e) => handleAnswerChange(lesson.quiz.id, index, 'answerText', e.target.value)}
                                              placeholder={`Đáp án ${index + 1}`}
                                              className="block w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600"
                                            />
                                            <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
                                              <input
                                                type="radio"
                                                name={`correct-answer-${lesson.quiz.id}`}
                                                checked={Boolean(answer.isCorrect)}
                                                onChange={() => handleChooseCorrectAnswer(lesson.quiz.id, index)}
                                              />
                                              Đáp án đúng
                                            </label>
                                          </div>
                                        ))}
                                      </div>

                                      <Button type="button" onClick={() => handleCreateQuestion(lesson.quiz.id)}>
                                        Thêm câu hỏi
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    {(lesson.quiz.questions || []).map((question, questionIndex) => (
                                      <div key={question.id} className="rounded-[20px] bg-white p-4">
                                        <div className="flex items-start justify-between gap-3">
                                          <div>
                                            <p className="font-semibold text-slate-900">
                                              Câu {questionIndex + 1}. {question.questionText}
                                            </p>
                                            <div className="mt-3 space-y-2">
                                              {(question.answers || []).map((answer) => (
                                                <div
                                                  key={answer.id}
                                                  className={`rounded-xl px-3 py-2 text-sm ${
                                                    answer.isCorrect
                                                      ? 'bg-emerald-50 text-emerald-700'
                                                      : 'bg-slate-50 text-slate-700'
                                                  }`}
                                                >
                                                  {answer.answerText}
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleDeleteQuestion(question.id)}
                                          >
                                            Xóa câu hỏi
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/courses')}>
              Quay lại danh sách khóa học
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}