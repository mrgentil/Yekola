import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import Loading from '../../components/student/Loading'

const AdminPayments = () => {
  const { backendUrl, getAccessToken, currency } = useContext(AppContext)
  const [payments, setPayments] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [activeTab, setActiveTab] = useState('pending') // 'pending' or 'completed'
  const [processingId, setProcessingId] = useState(null)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const token = await getAccessToken()
      if (!token) return

      const { data } = await axios.get(`${backendUrl}/api/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: 10, status: statusFilter }
      })

      if (data.success) {
        setPayments(data.payments)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const token = await getAccessToken()
      if (!token) return

      const { data } = await axios.get(`${backendUrl}/api/user/admin/pending-payments`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setPendingRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      setProcessingId(requestId)
      const token = await getAccessToken()
      
      const { data } = await axios.post(
        `${backendUrl}/api/user/admin/approve-payment/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success('✅ Paiement approuvé ! Étudiant inscrit au cours.')
        fetchPendingRequests()
        fetchPayments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'approbation')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId) => {
    const reason = prompt('Raison du rejet (optionnel):')
    try {
      setProcessingId(requestId)
      const token = await getAccessToken()
      
      const { data } = await axios.post(
        `${backendUrl}/api/user/admin/reject-payment/${requestId}`,
        { adminNote: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success('Demande rejetée')
        fetchPendingRequests()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet')
    } finally {
      setProcessingId(null)
    }
  }

  useEffect(() => {
    fetchPayments()
    fetchPendingRequests()
  }, [currentPage, statusFilter])

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700'
    }
    const labels = {
      completed: 'Complété',
      pending: 'En attente',
      failed: 'Échoué'
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || badges.pending}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading && payments.length === 0) return <Loading />

  return (
    <div className='p-6 md:p-8'>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-8'
      >
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Gestion des paiements</h1>
        <p className='text-gray-500 mt-1'>
          {pendingRequests.length > 0 && (
            <span className='text-orange-600 font-semibold'>
              🔔 {pendingRequests.length} demande(s) en attente de validation
            </span>
          )}
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='flex gap-2 mb-6'
      >
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'pending'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          🔔 Demandes en attente
          {pendingRequests.length > 0 && (
            <span className='ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm'>
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'completed'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          ✅ Historique ({total})
        </button>
      </motion.div>

      {/* Pending Requests Section */}
      {activeTab === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'
        >
          <div className='p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50'>
            <h2 className='text-lg font-semibold text-gray-900'>Demandes de paiement Mobile Money</h2>
            <p className='text-sm text-gray-500'>Vérifiez les transactions et approuvez pour inscrire les étudiants</p>
          </div>
          
          {pendingRequests.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='text-6xl mb-4'>✅</div>
              <p className='text-gray-500'>Aucune demande en attente</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {pendingRequests.map((request) => (
                <div key={request._id} className='p-6 hover:bg-gray-50 transition-colors'>
                  <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold'>
                          {request.userId?.firstName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900'>
                            {request.userId?.firstName} {request.userId?.lastName}
                          </p>
                          <p className='text-sm text-gray-500'>{request.userId?.email}</p>
                        </div>
                      </div>
                      <div className='ml-13 space-y-1'>
                        <p className='text-sm'>
                          <span className='text-gray-500'>Cours:</span>{' '}
                          <span className='font-medium'>{request.courseId?.courseTitle}</span>
                        </p>
                        <p className='text-sm'>
                          <span className='text-gray-500'>Montant:</span>{' '}
                          <span className='font-bold text-green-600'>{currency}{request.amount}</span>
                        </p>
                        <p className='text-sm'>
                          <span className='text-gray-500'>Méthode:</span>{' '}
                          <span className='uppercase font-medium'>{request.paymentMethod?.replace('_', ' ')}</span>
                        </p>
                        <p className='text-sm'>
                          <span className='text-gray-500'>Téléphone:</span>{' '}
                          <span className='font-mono'>{request.phoneNumber}</span>
                        </p>
                        <p className='text-sm'>
                          <span className='text-gray-500'>Référence:</span>{' '}
                          <span className='font-mono bg-gray-100 px-2 py-0.5 rounded'>{request.transactionRef}</span>
                        </p>
                        <p className='text-xs text-gray-400'>
                          Soumis le {new Date(request.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-3'>
                      <button
                        onClick={() => handleApprove(request._id)}
                        disabled={processingId === request._id}
                        className='px-6 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                      >
                        {processingId === request._id ? (
                          <span className='animate-spin'>⏳</span>
                        ) : (
                          '✅'
                        )}
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        disabled={processingId === request._id}
                        className='px-6 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        ❌ Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Completed Payments Section */}
      {activeTab === 'completed' && (
        <>
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'
          >
            <div className='flex flex-col md:flex-row gap-4'>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className='px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white'
              >
                <option value='all'>Tous les statuts</option>
                <option value='completed'>Complétés</option>
                <option value='pending'>En attente</option>
                <option value='failed'>Échoués</option>
              </select>
            </div>
          </motion.div>

      {/* Payments Table */}
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
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>ID Transaction</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Utilisateur</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Cours</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Montant</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Statut</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Date</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              <AnimatePresence>
                {payments.map((payment, index) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <p className='text-sm font-mono text-gray-500'>
                        #{payment._id?.slice(-8).toUpperCase()}
                      </p>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                          {payment.userId?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {payment.userId?.firstName} {payment.userId?.lastName}
                          </p>
                          <p className='text-xs text-gray-500'>{payment.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <p className='text-sm text-gray-900 truncate max-w-xs'>
                        {payment.courseId?.courseTitle || 'Cours supprimé'}
                      </p>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <p className='text-sm font-semibold text-gray-900'>
                        {currency}{payment.amount || payment.courseId?.coursePrice || '0'}
                      </p>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <p className='text-sm text-gray-500'>
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {payments.length === 0 && (
                <tr>
                  <td colSpan='6' className='px-6 py-12 text-center text-gray-500'>
                    Aucune transaction trouvée
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
        </>
      )}
    </div>
  )
}

export default AdminPayments
