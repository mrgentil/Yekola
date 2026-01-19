import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const QuizPlayer = ({ quizId, onClose, onComplete }) => {
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState(null)
  const [detailedResults, setDetailedResults] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [startTime] = useState(Date.now())

  const fetchQuiz = async () => {
    try {
      const token = await getAccessToken()
      const { data } = await axios.get(`${backendUrl}/api/quiz/take/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setQuiz(data.quiz)
        setAnswers(new Array(data.quiz.questions.length).fill(null))
        if (data.quiz.timeLimit > 0) {
          setTimeLeft(data.quiz.timeLimit * 60)
        }
      } else {
        toast.error(data.message)
        onClose?.()
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du quiz')
      onClose?.()
    } finally {
      setLoading(false)
    }
  }

  const submitQuiz = async () => {
    const unanswered = answers.filter(a => a === null).length
    if (unanswered > 0) {
      const confirm = window.confirm(`Vous avez ${unanswered} question(s) sans réponse. Soumettre quand même ?`)
      if (!confirm) return
    }

    setSubmitting(true)
    try {
      const token = await getAccessToken()
      const timeTaken = Math.round((Date.now() - startTime) / 1000)

      const { data } = await axios.post(
        `${backendUrl}/api/quiz/submit/${quizId}`,
        {
          answers: answers.map((selectedAnswer, index) => ({
            questionIndex: index,
            selectedAnswer
          })),
          timeTaken
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setResults(data.result)
        setDetailedResults(data.detailedResults)
        setShowResults(true)
        onComplete?.(data.result)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const selectAnswer = (questionIndex, answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResults) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, showResults])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement du quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) return null

  // Results view
  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Results Header */}
          <div className={`p-6 text-center ${results.passed ? 'bg-green-500' : 'bg-red-500'}`}>
            <div className="text-6xl mb-2">{results.passed ? '🎉' : '😔'}</div>
            <h2 className="text-2xl font-bold text-white">
              {results.passed ? 'Félicitations !' : 'Dommage...'}
            </h2>
            <p className="text-white/90">
              {results.passed ? 'Vous avez réussi le quiz !' : 'Vous pouvez réessayer'}
            </p>
          </div>

          {/* Score */}
          <div className="p-6 border-b">
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{results.score}%</div>
                <p className="text-gray-500 text-sm">Score</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {results.correctCount}/{results.totalQuestions}
                </div>
                <p className="text-gray-500 text-sm">Bonnes réponses</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{results.passingScore}%</div>
                <p className="text-gray-500 text-sm">Score requis</p>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 mb-4">Détail des réponses</h3>
            {detailedResults.map((q, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  q.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className={`text-lg ${q.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {q.isCorrect ? '✓' : '✗'}
                  </span>
                  <p className="font-medium text-gray-900">{q.question}</p>
                </div>
                <div className="ml-6 space-y-1 text-sm">
                  {q.options.map((opt, j) => (
                    <div
                      key={j}
                      className={`p-2 rounded ${
                        j === q.correctAnswer
                          ? 'bg-green-100 text-green-800'
                          : j === q.selectedAnswer && !q.isCorrect
                          ? 'bg-red-100 text-red-800'
                          : 'text-gray-600'
                      }`}
                    >
                      {j === q.correctAnswer && '✓ '}
                      {j === q.selectedAnswer && j !== q.correctAnswer && '✗ '}
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="ml-6 mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div className="p-6 border-t">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz view
  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-900">{quiz.title}</h2>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className={`px-3 py-1 rounded-full font-mono ${
                  timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  ⏱️ {formatTime(timeLeft)}
                </div>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Question {currentQuestion + 1} sur {quiz.questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(currentQuestion, i)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  answers[currentQuestion] === i
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === i
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === i && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            ← Précédent
          </button>

          <div className="flex gap-1">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 rounded-full text-sm ${
                  i === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[i] !== null
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {submitting ? 'Envoi...' : 'Terminer ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizPlayer
