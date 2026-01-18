import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import Loading from '../../components/student/Loading'

const AdminCourses = () => {
  const { backendUrl, getAccessToken, currency } = useContext(AppContext)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const token = await getAccessToken()
      if (!token) return

      const { data } = await axios.get(`${backendUrl}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: 10, search: searchTerm }
      })

      if (data.success) {
        setCourses(data.courses)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [currentPage])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCourses()
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return

    try {
      const token = await getAccessToken()
      const { data } = await axios.delete(`${backendUrl}/api/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success('Cours supprimé avec succès')
        fetchCourses()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  if (loading && courses.length === 0) return <Loading />

  return (
    <div className='p-6 md:p-8'>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-8'
      >
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Gestion des cours</h1>
        <p className='text-gray-500 mt-1'>{total} cours au total</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'
      >
        <form onSubmit={handleSearch}>
          <div className='relative'>
            <input
              type='text'
              placeholder='Rechercher un cours...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
            />
            <svg className='w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
          </div>
        </form>
      </motion.div>

      {/* Courses Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      >
        <AnimatePresence>
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300'
            >
              <div className='relative'>
                <img 
                  src={course.courseThumbnail} 
                  alt={course.courseTitle}
                  className='w-full h-40 object-cover'
                />
                {course.discount > 0 && (
                  <span className='absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>
                    -{course.discount}%
                  </span>
                )}
              </div>
              
              <div className='p-5'>
                <h3 className='font-bold text-gray-900 mb-3 line-clamp-2'>{course.courseTitle}</h3>
                
                {/* Éducateur / Publié par */}
                <div className='bg-blue-50 rounded-xl p-3 mb-3'>
                  <p className='text-xs text-blue-600 font-semibold mb-1'>👨‍🏫 Publié par</p>
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                      {course.educator?.firstName?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {course.educator?.firstName} {course.educator?.lastName}
                      </p>
                      <p className='text-xs text-gray-500'>{course.educator?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className='grid grid-cols-2 gap-2 mb-3'>
                  <div className='bg-gray-50 rounded-lg p-2 text-center'>
                    <p className='text-lg font-bold text-gray-900'>
                      {currency}{(course.coursePrice - course.coursePrice * (course.discount || 0) / 100).toFixed(0)}
                    </p>
                    <p className='text-xs text-gray-500'>Prix</p>
                  </div>
                  <div className='bg-gray-50 rounded-lg p-2 text-center'>
                    <p className='text-lg font-bold text-gray-900'>
                      {course.enrolledStudents?.length || 0}
                    </p>
                    <p className='text-xs text-gray-500'>Inscrits</p>
                  </div>
                </div>

                {/* Date de création */}
                <p className='text-xs text-gray-400 mb-3'>
                  📅 Créé le {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                </p>

                <div className='flex items-center gap-2'>
                  <span className={`flex-1 text-center py-2 rounded-lg text-sm font-medium ${
                    course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.isPublished ? 'Publié' : 'Brouillon'}
                  </span>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                    title='Supprimer'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {courses.length === 0 && !loading && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>Aucun cours trouvé</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-8 flex justify-center gap-2'>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Précédent
          </button>
          <span className='px-4 py-2 text-sm text-gray-500'>
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminCourses
