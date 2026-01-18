import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Loading from '../../components/student/Loading'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import Logger from '../../components/Logger'
import UserAvatar from '../../components/UserAvatar'
import { motion, AnimatePresence } from 'framer-motion'

const StudentsEnrolled = () => {
  const {backendUrl, getAccessToken, isEducator} = useContext(AppContext)
  const [enrolledStudents, setEnrolledStudents] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const itemsPerPage = 8

  const fetchEnrolledStudents = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error('Authentication required')
        return
      }

      const { data } = await axios.get(`${backendUrl}/api/educator/enrolled-students`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if(isEducator){
      fetchEnrolledStudents();
    }
  }, [isEducator])

  const getFilteredStudents = () => {
    if (!enrolledStudents) return []
    let filtered = enrolledStudents.filter(item => {
      const studentName = `${item.student?.firstName || ''} ${item.student?.lastName || ''}`.toLowerCase()
      const courseTitle = (item.courseTitle || '').toLowerCase()
      return studentName.includes(searchTerm.toLowerCase()) || courseTitle.includes(searchTerm.toLowerCase())
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal, bVal
        switch(sortConfig.key) {
          case 'student':
            aVal = `${a.student?.firstName || ''} ${a.student?.lastName || ''}`
            bVal = `${b.student?.firstName || ''} ${b.student?.lastName || ''}`
            break
          case 'course':
            aVal = a.courseTitle || ''
            bVal = b.courseTitle || ''
            break
          case 'date':
            aVal = new Date(a.purchaseDate)
            bVal = new Date(b.purchaseDate)
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

  const filteredStudents = getFilteredStudents()
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const SortIcon = ({ columnKey }) => (
    sortConfig.key === columnKey && (
      <svg className={`w-4 h-4 inline ml-1 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    )
  )

  return enrolledStudents ? (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      {/* Mobile Logger */}
      <div className="block sm:hidden mb-6">
        <Logger/>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Étudiants inscrits</h1>
        <p className='text-gray-500 mt-1'>{enrolledStudents.length} inscriptions au total</p>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">👨‍🎓</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{enrolledStudents.length}</p>
              <p className="text-sm text-gray-500">Total inscriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">📅</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {enrolledStudents.filter(s => {
                  const date = new Date(s.purchaseDate)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </p>
              <p className="text-sm text-gray-500">Ce mois-ci</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">📚</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {[...new Set(enrolledStudents.map(s => s.courseTitle))].length}
              </p>
              <p className="text-sm text-gray-500">Cours actifs</p>
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
            <h2 className="text-xl font-bold text-gray-900">Liste des étudiants</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('student')} className="flex items-center hover:text-gray-700">
                    Étudiant <SortIcon columnKey="student" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('course')} className="flex items-center hover:text-gray-700">
                    Cours <SortIcon columnKey="course" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('date')} className="flex items-center hover:text-gray-700">
                    Date <SortIcon columnKey="date" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {paginatedStudents.length > 0 ? paginatedStudents.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          src={item.student?.imageUrl} 
                          alt={`${item.student?.firstName || 'U'}`}
                          className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.student?.firstName || 'Unknown'} {item.student?.lastName || 'Student'}
                          </p>
                          <p className="text-xs text-gray-500">{item.student?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 truncate max-w-xs">{item.courseTitle}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{new Date(item.purchaseDate).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-gray-500">{new Date(item.purchaseDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                        Actif
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir profil">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Envoyer email">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500">Aucun étudiant trouvé</p>
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
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredStudents.length)} sur {filteredStudents.length} étudiants
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
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

export default StudentsEnrolled
