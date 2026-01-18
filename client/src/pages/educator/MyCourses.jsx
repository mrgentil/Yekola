import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'
import Logger from '../../components/Logger'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const MyCourses = () => {
  const {currency, backendUrl, isEducator, getAccessToken} = useContext(AppContext)
  const [courses, setCourses] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const itemsPerPage = 5

  const fetchCourses = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error('Authentification requise')
        return
      }

      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setCourses(data.courses)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.')) {
      return
    }

    try {
      const token = await getAccessToken();
      const { data } = await axios.delete(`${backendUrl}/api/educator/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success('Cours supprimé avec succès')
        fetchCourses()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if(isEducator){
      fetchCourses();
    }
  }, [isEducator])

  const getFilteredCourses = () => {
    if (!courses) return []
    let filtered = courses.filter(course => 
      course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal, bVal
        switch(sortConfig.key) {
          case 'title':
            aVal = a.courseTitle
            bVal = b.courseTitle
            break
          case 'price':
            aVal = a.coursePrice - a.discount * a.coursePrice / 100
            bVal = b.coursePrice - b.discount * b.coursePrice / 100
            break
          case 'students':
            aVal = a.enrolledStudents?.length || 0
            bVal = b.enrolledStudents?.length || 0
            break
          case 'earnings':
            aVal = (a.enrolledStudents?.length || 0) * (a.coursePrice - a.discount * a.coursePrice / 100)
            bVal = (b.enrolledStudents?.length || 0) * (b.coursePrice - b.discount * b.coursePrice / 100)
            break
          default:
            return 0
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return filtered
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const filteredCourses = getFilteredCourses()
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalEarnings = courses?.reduce((acc, course) => {
    const price = course.coursePrice - course.discount * course.coursePrice / 100
    return acc + (course.enrolledStudents?.length || 0) * price
  }, 0) || 0

  const totalStudents = courses?.reduce((acc, course) => acc + (course.enrolledStudents?.length || 0), 0) || 0

  const SortIcon = ({ columnKey }) => (
    sortConfig.key === columnKey && (
      <svg className={`w-4 h-4 inline ml-1 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    )
  )

  return courses ? (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      {/* Mobile Logger */}
      <div className="block sm:hidden mb-6">
        <Logger/>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
      >
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Mes Cours</h1>
          <p className='text-gray-500 mt-1'>{courses.length} cours créés</p>
        </div>
        <Link 
          to="/educator/add-course"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau cours
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">📚</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-sm text-gray-500">Total Cours</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">💰</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{currency}{totalEarnings.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Revenus totaux</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">👨‍🎓</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-sm text-gray-500">Étudiants inscrits</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Table Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Liste des cours</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('title')} className="flex items-center hover:text-gray-700">
                    Cours <SortIcon columnKey="title" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('price')} className="flex items-center hover:text-gray-700">
                    Prix <SortIcon columnKey="price" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('students')} className="flex items-center hover:text-gray-700">
                    Étudiants <SortIcon columnKey="students" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('earnings')} className="flex items-center hover:text-gray-700">
                    Revenus <SortIcon columnKey="earnings" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {paginatedCourses.length > 0 ? paginatedCourses.map((course, index) => {
                  const finalPrice = course.coursePrice - course.discount * course.coursePrice / 100
                  const earnings = (course.enrolledStudents?.length || 0) * finalPrice
                  
                  return (
                    <motion.tr
                      key={course._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={course.courseThumbnail} 
                            alt={course.courseTitle}
                            className="w-16 h-10 object-cover rounded-lg"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{course.courseTitle}</p>
                            <p className="text-xs text-gray-500">{new Date(course.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {finalPrice === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Gratuit
                          </span>
                        ) : (
                          <div>
                            <span className="text-sm font-semibold text-gray-900">${finalPrice.toFixed(2)}</span>
                            {course.discount > 0 && (
                              <span className="ml-2 text-xs text-red-500">-{course.discount}%</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{course.enrolledStudents?.length || 0}</span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min((course.enrolledStudents?.length || 0) * 10, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-green-600">{currency}{earnings.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                          Publié
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/course/${course._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button 
                            className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(course._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500">Aucun cours trouvé</p>
                        <Link to="/educator/add-course" className="mt-4 text-blue-600 hover:underline">
                          Créer votre premier cours
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredCourses.length)} sur {filteredCourses.length} cours
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  ) : (
    <Loading/>
  )
}

export default MyCourses
