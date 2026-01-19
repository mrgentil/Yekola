import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const QuizManager = () => {
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [quizzes, setQuizzes] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [formData, setFormData] = useState({
    courseId: '',
    chapterIndex: 0,
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: 0,
    questions: []
  })

  const fetchData = async () => {
    try {
      const token = await getAccessToken()
      const [quizzesRes, coursesRes] = await Promise.all([
        axios.get(`${backendUrl}/api/quiz/educator/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${backendUrl}/api/educator/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (quizzesRes.data.success) setQuizzes(quizzesRes.data.quizzes)
      if (coursesRes.data.success) setCourses(coursesRes.data.courses)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
      ]
    })
  }

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions]
    newQuestions[index][field] = value
    setFormData({ ...formData, questions: newQuestions })
  }

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions]
    newQuestions[qIndex].options[oIndex] = value
    setFormData({ ...formData, questions: newQuestions })
  }

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index)
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.courseId || !formData.title || formData.questions.length === 0) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i]
      if (!q.question || q.options.some(o => !o.trim())) {
        toast.error(`Question ${i + 1}: Veuillez remplir la question et toutes les options`)
        return
      }
    }

    try {
      const token = await getAccessToken()
      const url = editingQuiz 
        ? `${backendUrl}/api/quiz/update/${editingQuiz._id}`
        : `${backendUrl}/api/quiz/create`
      
      const method = editingQuiz ? 'put' : 'post'

      const { data } = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success(editingQuiz ? 'Quiz mis à jour !' : 'Quiz créé !')
        resetForm()
        fetchData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Supprimer ce quiz ?')) return

    try {
      const token = await getAccessToken()
      const { data } = await axios.delete(`${backendUrl}/api/quiz/delete/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success('Quiz supprimé')
        fetchData()
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const editQuiz = (quiz) => {
    setEditingQuiz(quiz)
    setFormData({
      courseId: quiz.courseId._id || quiz.courseId,
      chapterIndex: quiz.chapterIndex,
      title: quiz.title,
      description: quiz.description || '',
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingQuiz(null)
    setFormData({
      courseId: '',
      chapterIndex: 0,
      title: '',
      description: '',
      passingScore: 70,
      timeLimit: 0,
      questions: []
    })
  }

  const selectedCourse = courses.find(c => c._id === formData.courseId)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📝 Gestion des Quiz</h1>
          <p className="text-gray-500">Créez des quiz pour évaluer vos étudiants</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          + Nouveau Quiz
        </button>
      </div>

      {/* Quiz Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingQuiz ? 'Modifier le quiz' : 'Créer un quiz'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cours *</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value, chapterIndex: 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner un cours</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.courseTitle}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapitre *</label>
                  <select
                    value={formData.chapterIndex}
                    onChange={(e) => setFormData({ ...formData, chapterIndex: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    disabled={!selectedCourse}
                  >
                    {selectedCourse?.courseContent?.map((chapter, i) => (
                      <option key={i} value={i}>Chapitre {i + 1}: {chapter.chapterTitle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du quiz *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Quiz - Les bases de React"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Description optionnelle du quiz"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score requis (%)</label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps limite (min, 0 = illimité)</label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min={0}
                  />
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Questions ({formData.questions.length})</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    + Ajouter une question
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.questions.map((q, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-medium text-gray-700">Question {qIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
                        placeholder="Entrez la question..."
                      />

                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correctAnswer === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                              className="w-4 h-4 text-green-600"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className={`flex-1 border rounded-lg px-3 py-2 ${
                                q.correctAnswer === oIndex ? 'border-green-500 bg-green-50' : 'border-gray-300'
                              }`}
                              placeholder={`Option ${oIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="Explication (optionnelle) - affichée après la réponse"
                      />
                    </div>
                  ))}

                  {formData.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucune question ajoutée</p>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        + Ajouter votre première question
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingQuiz ? 'Mettre à jour' : 'Créer le quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun quiz créé</h3>
          <p className="text-gray-500 mb-4">Créez des quiz pour évaluer vos étudiants</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer mon premier quiz
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{quiz.title}</h3>
                    {quiz.isActive ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Actif</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Inactif</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {quiz.courseId?.courseTitle} • Chapitre {quiz.chapterIndex + 1}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📚 {quiz.questions?.length || 0} questions</span>
                    <span>✅ Score requis: {quiz.passingScore}%</span>
                    {quiz.timeLimit > 0 && <span>⏱️ {quiz.timeLimit} min</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editQuiz(quiz)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz._id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Stats */}
              {quiz.stats && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{quiz.stats.attempts}</div>
                    <div className="text-xs text-gray-500">Tentatives</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{quiz.stats.passed}</div>
                    <div className="text-xs text-gray-500">Réussis</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{quiz.stats.passRate}%</div>
                    <div className="text-xs text-gray-500">Taux réussite</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{quiz.stats.avgScore}%</div>
                    <div className="text-xs text-gray-500">Score moyen</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizManager
