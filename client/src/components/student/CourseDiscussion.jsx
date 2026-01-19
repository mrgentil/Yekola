import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const CourseDiscussion = ({ courseId, lectureId = null }) => {
  const { backendUrl, getAccessToken, userData } = useContext(AppContext)
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' })
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [filter, setFilter] = useState('recent')
  const [submitting, setSubmitting] = useState(false)

  const fetchDiscussions = async () => {
    try {
      const params = new URLSearchParams({ sort: filter })
      if (lectureId) params.append('lectureId', lectureId)

      const { data } = await axios.get(
        `${backendUrl}/api/discussion/course/${courseId}?${params}`
      )
      if (data.success) {
        setDiscussions(data.discussions)
      }
    } catch (error) {
      console.error('Fetch discussions error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createQuestion = async (e) => {
    e.preventDefault()
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setSubmitting(true)
    try {
      const token = await getAccessToken()
      const { data } = await axios.post(
        `${backendUrl}/api/discussion/create`,
        { courseId, lectureId, ...newQuestion },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success('Question publiée !')
        setNewQuestion({ title: '', content: '' })
        setShowForm(false)
        fetchDiscussions()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erreur lors de la publication')
    } finally {
      setSubmitting(false)
    }
  }

  const addReply = async (discussionId) => {
    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      const token = await getAccessToken()
      const { data } = await axios.post(
        `${backendUrl}/api/discussion/reply/${discussionId}`,
        { content: replyContent },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success('Réponse ajoutée !')
        setReplyContent('')
        setSelectedDiscussion(data.discussion)
        fetchDiscussions()
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la réponse')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLike = async (discussionId) => {
    try {
      const token = await getAccessToken()
      const { data } = await axios.post(
        `${backendUrl}/api/discussion/like/${discussionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        fetchDiscussions()
      }
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  const viewDiscussion = async (discussionId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/discussion/${discussionId}`)
      if (data.success) {
        setSelectedDiscussion(data.discussion)
      }
    } catch (error) {
      console.error('View discussion error:', error)
    }
  }

  useEffect(() => {
    fetchDiscussions()
  }, [courseId, lectureId, filter])

  const formatDate = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return new Date(date).toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            💬 Questions & Réponses ({discussions.length})
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Poser une question
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { value: 'recent', label: 'Récentes' },
            { value: 'popular', label: 'Populaires' },
            { value: 'unanswered', label: 'Sans réponse' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === f.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* New Question Form */}
      {showForm && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <form onSubmit={createQuestion}>
            <input
              type="text"
              placeholder="Titre de votre question..."
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Décrivez votre question en détail..."
              value={newQuestion.content}
              onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submitting ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discussion Detail View */}
      {selectedDiscussion ? (
        <div className="p-4">
          <button
            onClick={() => setSelectedDiscussion(null)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
          >
            ← Retour aux questions
          </button>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {selectedDiscussion.userId?.firstName?.[0] || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {selectedDiscussion.userId?.firstName} {selectedDiscussion.userId?.lastName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(selectedDiscussion.createdAt)}
                  </span>
                  {selectedDiscussion.isPinned && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">📌 Épinglé</span>
                  )}
                  {selectedDiscussion.isResolved && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✅ Résolu</span>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{selectedDiscussion.title}</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedDiscussion.content}</p>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-3 mb-4">
            <h5 className="font-medium text-gray-700">
              {selectedDiscussion.replies?.length || 0} réponse(s)
            </h5>
            {selectedDiscussion.replies?.map((reply, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  reply.isInstructor ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    reply.isInstructor ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {reply.userId?.firstName?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {reply.userId?.firstName} {reply.userId?.lastName}
                      </span>
                      {reply.isInstructor && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          👨‍🏫 Instructeur
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <div className="border-t border-gray-200 pt-4">
            <textarea
              placeholder="Écrire une réponse..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <button
              onClick={() => addReply(selectedDiscussion._id)}
              disabled={submitting || !replyContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Envoi...' : 'Répondre'}
            </button>
          </div>
        </div>
      ) : (
        /* Discussion List */
        <div className="divide-y divide-gray-100">
          {discussions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">💭</div>
              <p>Aucune question pour le moment</p>
              <p className="text-sm">Soyez le premier à poser une question !</p>
            </div>
          ) : (
            discussions.map((discussion) => (
              <div
                key={discussion._id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => viewDiscussion(discussion._id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {discussion.userId?.firstName?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-gray-900">
                        {discussion.userId?.firstName} {discussion.userId?.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(discussion.createdAt)}
                      </span>
                      {discussion.isPinned && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">📌</span>
                      )}
                      {discussion.isResolved && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✅</span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 truncate">{discussion.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{discussion.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        💬 {discussion.replies?.length || 0} réponse(s)
                      </span>
                      <span className="flex items-center gap-1">
                        👁️ {discussion.views || 0} vue(s)
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(discussion._id)
                        }}
                        className={`flex items-center gap-1 hover:text-red-500 ${
                          discussion.likes?.includes(userData?._id) ? 'text-red-500' : ''
                        }`}
                      >
                        ❤️ {discussion.likes?.length || 0}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default CourseDiscussion
