import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import Loading from '../../components/student/Loading'

const AdminUsers = () => {
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = await getAccessToken()
      if (!token) return

      const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: 10, role: roleFilter, search: searchTerm }
      })

      if (data.success) {
        setUsers(data.users)
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
    fetchUsers()
  }, [currentPage, roleFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = await getAccessToken()
      const { data } = await axios.put(
        `${backendUrl}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success('Rôle mis à jour avec succès')
        fetchUsers()
        setShowModal(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    try {
      const token = await getAccessToken()
      const { data } = await axios.delete(`${backendUrl}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success('Utilisateur supprimé avec succès')
        fetchUsers()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-700',
      educator: 'bg-purple-100 text-purple-700',
      student: 'bg-blue-100 text-blue-700'
    }
    const labels = {
      admin: 'Admin',
      educator: 'Éducateur',
      student: 'Étudiant'
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[role]}`}>
        {labels[role]}
      </span>
    )
  }

  if (loading && users.length === 0) return <Loading />

  return (
    <div className='p-6 md:p-8'>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-8'
      >
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Gestion des utilisateurs</h1>
        <p className='text-gray-500 mt-1'>{total} utilisateurs au total</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'
      >
        <div className='flex flex-col md:flex-row gap-4'>
          {/* Search */}
          <form onSubmit={handleSearch} className='flex-1'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Rechercher par nom ou email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
              />
              <svg className='w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>
          </form>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className='px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white'
          >
            <option value='all'>Tous les rôles</option>
            <option value='student'>Étudiants</option>
            <option value='educator'>Éducateurs</option>
            <option value='admin'>Administrateurs</option>
          </select>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
      >
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Utilisateur</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Email</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Rôle</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Inscrit le</th>
                <th className='px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              <AnimatePresence>
                {users.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold'>
                          {user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {user.firstName} {user.lastName}
                          </p>
                          <p className='text-xs text-gray-500'>{user.phone || 'Pas de téléphone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <p className='text-sm text-gray-900'>{user.email}</p>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {getRoleBadge(user.role)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <p className='text-sm text-gray-500'>
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          onClick={() => { setSelectedUser(user); setShowModal(true); }}
                          className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                          title='Modifier le rôle'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                          title='Supprimer'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {users.length === 0 && (
                <tr>
                  <td colSpan='5' className='px-6 py-12 text-center text-gray-500'>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <p className='text-sm text-gray-500'>
              Page {currentPage} sur {totalPages}
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Role Modal */}
      {showModal && selectedUser && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-white rounded-2xl p-6 max-w-md w-full'
          >
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Modifier le rôle</h3>
            <p className='text-gray-500 mb-6'>
              Utilisateur: <span className='font-medium text-gray-900'>{selectedUser.firstName} {selectedUser.lastName}</span>
            </p>
            
            <div className='space-y-3 mb-6'>
              {['student', 'educator', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(selectedUser._id, role)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedUser.role === role 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className='font-medium text-gray-900'>
                    {role === 'student' ? '🎓 Étudiant' : role === 'educator' ? '👨‍🏫 Éducateur' : '🛡️ Administrateur'}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {role === 'student' ? 'Peut s\'inscrire aux cours' : role === 'educator' ? 'Peut créer et gérer des cours' : 'Accès complet à l\'administration'}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className='w-full py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors'
            >
              Annuler
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
