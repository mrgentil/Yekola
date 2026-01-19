import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../components/student/Loading'

const AdminPayouts = () => {
  const { backendUrl, getAccessToken, currency } = useContext(AppContext)
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState('')
  const [transactionRef, setTransactionRef] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchPayouts = async () => {
    try {
      const token = await getAccessToken()
      const { data } = await axios.get(`${backendUrl}/api/payout/admin/all?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setRequests(data.requests)
        setStats(data.stats)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des demandes')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedRequest) return
    setProcessing(true)

    try {
      const token = await getAccessToken()
      let endpoint = ''
      let body = {}

      if (modalAction === 'approve') {
        endpoint = `/api/payout/admin/approve/${selectedRequest._id}`
        body = { transactionReference: transactionRef, adminNote }
      } else if (modalAction === 'reject') {
        endpoint = `/api/payout/admin/reject/${selectedRequest._id}`
        body = { adminNote }
      } else if (modalAction === 'processing') {
        endpoint = `/api/payout/admin/processing/${selectedRequest._id}`
        body = {}
      }

      const { data } = await axios.post(`${backendUrl}${endpoint}`, body, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success(data.message)
        setShowModal(false)
        setSelectedRequest(null)
        setTransactionRef('')
        setAdminNote('')
        fetchPayouts()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erreur lors du traitement')
    } finally {
      setProcessing(false)
    }
  }

  const openModal = (request, action) => {
    setSelectedRequest(request)
    setModalAction(action)
    setShowModal(true)
  }

  useEffect(() => {
    fetchPayouts()
  }, [filter])

  if (loading) return <Loading />

  return (
    <div className='min-h-screen p-6 md:p-10'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>💳 Gestion des retraits</h1>
        <p className='text-gray-500 mt-1'>Gérez les demandes de retrait des éducateurs</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
          <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center'>
            <p className='text-2xl font-bold text-yellow-600'>{stats.pending}</p>
            <p className='text-sm text-yellow-700'>En attente</p>
          </div>
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 text-center'>
            <p className='text-2xl font-bold text-blue-600'>{stats.processing}</p>
            <p className='text-sm text-blue-700'>En traitement</p>
          </div>
          <div className='bg-green-50 border border-green-200 rounded-xl p-4 text-center'>
            <p className='text-2xl font-bold text-green-600'>{stats.completed}</p>
            <p className='text-sm text-green-700'>Complétés</p>
          </div>
          <div className='bg-red-50 border border-red-200 rounded-xl p-4 text-center'>
            <p className='text-2xl font-bold text-red-600'>{stats.rejected}</p>
            <p className='text-sm text-red-700'>Rejetés</p>
          </div>
          <div className='bg-purple-50 border border-purple-200 rounded-xl p-4 text-center'>
            <p className='text-2xl font-bold text-purple-600'>{currency} {stats.totalPending?.toFixed(2) || '0.00'}</p>
            <p className='text-sm text-purple-700'>Total en attente</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className='flex gap-2 mb-6 flex-wrap'>
        {['all', 'pending', 'processing', 'completed', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' && 'Tous'}
            {f === 'pending' && '⏳ En attente'}
            {f === 'processing' && '🔄 En traitement'}
            {f === 'completed' && '✅ Complétés'}
            {f === 'rejected' && '❌ Rejetés'}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        {requests.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='text-left py-4 px-4 text-sm font-medium text-gray-500'>Éducateur</th>
                  <th className='text-left py-4 px-4 text-sm font-medium text-gray-500'>Montant</th>
                  <th className='text-left py-4 px-4 text-sm font-medium text-gray-500'>Méthode</th>
                  <th className='text-left py-4 px-4 text-sm font-medium text-gray-500'>Détails</th>
                  <th className='text-left py-4 px-4 text-sm font-medium text-gray-500'>Date</th>
                  <th className='text-left py-4 px-4 text-sm font-medium text-gray-500'>Statut</th>
                  <th className='text-left py-4 px-4 text-sm font-medium text-gray-500'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} className='border-t border-gray-100 hover:bg-gray-50'>
                    <td className='py-4 px-4'>
                      <div className='flex items-center gap-3'>
                        {request.educatorId?.imageUrl ? (
                          <img src={request.educatorId.imageUrl} alt='' className='w-10 h-10 rounded-full object-cover' />
                        ) : (
                          <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold'>
                            {request.educatorId?.firstName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <p className='font-medium text-gray-900'>
                            {request.educatorId?.firstName} {request.educatorId?.lastName}
                          </p>
                          <p className='text-xs text-gray-500'>{request.educatorId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className='py-4 px-4'>
                      <span className='font-bold text-gray-900'>{currency} {request.amount.toFixed(2)}</span>
                    </td>
                    <td className='py-4 px-4'>
                      <span className='px-2 py-1 bg-gray-100 rounded text-xs font-medium'>
                        {request.paymentMethod === 'mobile_money' && '📱 Mobile Money'}
                        {request.paymentMethod === 'bank_transfer' && '🏦 Virement'}
                        {request.paymentMethod === 'paypal' && '💳 PayPal'}
                      </span>
                    </td>
                    <td className='py-4 px-4 text-sm text-gray-600'>
                      {request.paymentMethod === 'mobile_money' && (
                        <div>
                          <p className='font-medium'>{request.mobileMoneyProvider?.toUpperCase()}</p>
                          <p>{request.phoneNumber}</p>
                        </div>
                      )}
                      {request.paymentMethod === 'bank_transfer' && (
                        <div>
                          <p className='font-medium'>{request.bankName}</p>
                          <p>{request.accountNumber}</p>
                          <p className='text-xs'>{request.accountName}</p>
                        </div>
                      )}
                      {request.paymentMethod === 'paypal' && (
                        <p>{request.paypalEmail}</p>
                      )}
                    </td>
                    <td className='py-4 px-4'>
                      <span className='text-sm text-gray-500'>
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className='py-4 px-4'>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        request.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        request.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {request.status === 'pending' && '⏳ En attente'}
                        {request.status === 'processing' && '🔄 En traitement'}
                        {request.status === 'completed' && '✅ Complété'}
                        {request.status === 'rejected' && '❌ Rejeté'}
                      </span>
                    </td>
                    <td className='py-4 px-4'>
                      {(request.status === 'pending' || request.status === 'processing') && (
                        <div className='flex gap-2'>
                          {request.status === 'pending' && (
                            <button
                              onClick={() => openModal(request, 'processing')}
                              className='px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200'
                            >
                              🔄 Traiter
                            </button>
                          )}
                          <button
                            onClick={() => openModal(request, 'approve')}
                            className='px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200'
                          >
                            ✅ Approuver
                          </button>
                          <button
                            onClick={() => openModal(request, 'reject')}
                            className='px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200'
                          >
                            ❌ Rejeter
                          </button>
                        </div>
                      )}
                      {request.status === 'completed' && request.transactionReference && (
                        <span className='text-xs text-gray-500'>Réf: {request.transactionReference}</span>
                      )}
                      {request.status === 'rejected' && request.adminNote && (
                        <span className='text-xs text-red-500'>{request.adminNote}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='text-center py-16 text-gray-500'>
            <span className='text-5xl mb-4 block'>📭</span>
            <p className='text-lg'>Aucune demande de retrait</p>
            <p className='text-sm'>Les demandes apparaîtront ici</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedRequest && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full'>
            <div className='p-6 border-b border-gray-100'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-bold text-gray-900'>
                  {modalAction === 'approve' && '✅ Approuver le retrait'}
                  {modalAction === 'reject' && '❌ Rejeter le retrait'}
                  {modalAction === 'processing' && '🔄 Marquer en traitement'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ✕
                </button>
              </div>
            </div>

            <div className='p-6 space-y-4'>
              {/* Request Summary */}
              <div className='bg-gray-50 rounded-xl p-4'>
                <p className='text-sm text-gray-600 mb-2'>Résumé de la demande</p>
                <div className='space-y-1'>
                  <p><strong>Éducateur:</strong> {selectedRequest.educatorId?.firstName} {selectedRequest.educatorId?.lastName}</p>
                  <p><strong>Montant:</strong> {currency} {selectedRequest.amount.toFixed(2)}</p>
                  <p><strong>Méthode:</strong> {selectedRequest.paymentMethod}</p>
                  {selectedRequest.phoneNumber && <p><strong>Tél:</strong> {selectedRequest.phoneNumber}</p>}
                </div>
              </div>

              {modalAction === 'approve' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Référence de transaction
                  </label>
                  <input
                    type='text'
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    placeholder='Ex: TXN123456789'
                  />
                </div>
              )}

              {(modalAction === 'approve' || modalAction === 'reject') && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Note {modalAction === 'reject' ? '(raison du rejet)' : '(optionnelle)'}
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    rows={3}
                    placeholder={modalAction === 'reject' ? 'Veuillez indiquer la raison du rejet...' : 'Note optionnelle...'}
                    required={modalAction === 'reject'}
                  />
                </div>
              )}

              <div className='flex gap-3 pt-4'>
                <button
                  onClick={() => setShowModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
                >
                  Annuler
                </button>
                <button
                  onClick={handleAction}
                  disabled={processing || (modalAction === 'reject' && !adminNote)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    modalAction === 'approve' ? 'bg-green-600 text-white hover:bg-green-700' :
                    modalAction === 'reject' ? 'bg-red-600 text-white hover:bg-red-700' :
                    'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {processing ? '⏳ Traitement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPayouts
