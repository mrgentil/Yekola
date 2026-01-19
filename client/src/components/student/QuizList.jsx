import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import QuizPlayer from './QuizPlayer'

const QuizList = ({ courseId }) => {
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [quizzes, setQuizzes] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const fetchQuizzes = async () => {
    try {
      const [quizzesRes, resultsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/quiz/course/${courseId}`),
        (async () => {
          const token = await getAccessToken()
          if (!token) return { data: { results: [] } }
          return axios.get(`${backendUrl}/api/quiz/results/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        })()
      ])

      if (quizzesRes.data.success) {
        setQuizzes(quizzesRes.data.quizzes)
      }
      if (resultsRes.data.success) {
        setResults(resultsRes.data.results)
      }
    } catch (error) {
      console.error('Fetch quizzes error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [courseId])

  const getQuizBestResult = (quizId) => {
    const quizResults = results.filter(r => r.quizId?._id === quizId)
    if (quizResults.length === 0) return null
    return quizResults.reduce((best, current) => 
      current.score > (best?.score || 0) ? current : best
    , null)
  }

  const handleQuizComplete = () => {
    fetchQuizzes()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (quizzes.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 mt-6">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">📝 Quiz & Évaluations</h3>
        <p className="text-sm text-gray-500">Testez vos connaissances après chaque chapitre</p>
      </div>

      <div className="divide-y divide-gray-100">
        {quizzes.map((quiz) => {
          const bestResult = getQuizBestResult(quiz._id)
          const passed = bestResult?.passed

          return (
            <div
              key={quiz._id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    passed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {passed ? '✓' : '📝'}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>Chapitre {quiz.chapterIndex + 1}</span>
                      <span>•</span>
                      <span>{quiz.questionsCount} questions</span>
                      {quiz.timeLimit > 0 && (
                        <>
                          <span>•</span>
                          <span>⏱️ {quiz.timeLimit} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {bestResult && (
                    <div className={`text-right ${passed ? 'text-green-600' : 'text-orange-600'}`}>
                      <div className="font-bold">{bestResult.score}%</div>
                      <div className="text-xs">{passed ? 'Réussi' : 'À améliorer'}</div>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedQuiz(quiz._id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      passed
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {bestResult ? 'Refaire' : 'Commencer'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quiz Player Modal */}
      {selectedQuiz && (
        <QuizPlayer
          quizId={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  )
}

export default QuizList
