import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../components/student/Loading'

const Earnings = () => {
  const { backendUrl, getAccessToken, currency } = useContext(AppContext)
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payoutRequests, setPayoutRequests] = useState([])
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    paymentMethod: 'mobile_money',
    mobileMoneyProvider: 'mpesa',
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    paypalEmail: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchEarnings = async () => {
    try {
      const token = await getAccessToken()
      const { data } = await axios.get(`${backendUrl}/api/educator/earnings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setEarnings(data.earnings)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des revenus')
    } finally {
      setLoading(false)
    }
  }

  const fetchPayoutRequests = async () => {
    try {
      const token = await getAccessToken()
      const { data } = await axios.get(`${backendUrl}/api/payout/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setPayoutRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching payout requests:', error)
    }
  }

  const handlePayoutSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = await getAccessToken()
      const { data } = await axios.post(`${backendUrl}/api/payout/request`, payoutForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        toast.success('Demande de retrait soumise avec succès!')
        setShowPayoutModal(false)
        setPayoutForm({
          amount: '',
          paymentMethod: 'mobile_money',
          mobileMoneyProvider: 'mpesa',
          phoneNumber: '',
          bankName: '',
          accountNumber: '',
          accountName: '',
          paypalEmail: ''
        })
        fetchEarnings()
        fetchPayoutRequests()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
    fetchPayoutRequests()
  }, [])

  if (loading) return <Loading />

  return (
    <div className='min-h-screen p-6 md:p-10'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>💰 Mes Revenus</h1>
        <p className='text-gray-500 mt-1'>Suivez vos gains et demandez des retraits</p>
      </div>

      {earnings && (
        <>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* Balance */}
            <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-green-100'>Solde disponible</span>
                <span className='text-3xl'>💵</span>
              </div>
              <p className='text-3xl font-bold'>{currency} {earnings.balance.toFixed(2)}</p>
              <p className='text-green-100 text-sm mt-2'>
                {earnings.canRequestPayout 
                  ? '✓ Retrait disponible' 
                  : `Min. ${currency}${earnings.minPayout} requis`}
              </p>
            </div>

            {/* Total Earnings */}
            <div className='bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-blue-100'>Total gagné</span>
                <span className='text-3xl'>📈</span>
              </div>
              <p className='text-3xl font-bold'>{currency} {earnings.totalEarnings.toFixed(2)}</p>
              <p className='text-blue-100 text-sm mt-2'>Depuis le début</p>
            </div>

            {/* Total Sales */}
            <div className='bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-purple-100'>Ventes totales</span>
                <span className='text-3xl'>🛒</span>
              </div>
              <p className='text-3xl font-bold'>{currency} {earnings.totalSales.toFixed(2)}</p>
              <p className='text-purple-100 text-sm mt-2'>Montant brut</p>
            </div>

            {/* Commission Rate */}
            <div className='bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-orange-100'>Votre part</span>
                <span className='text-3xl'>🎯</span>
              </div>
              <p className='text-3xl font-bold'>{earnings.educatorShareRate}%</p>
              <p className='text-orange-100 text-sm mt-2'>Commission plateforme: {earnings.commissionRate}%</p>
            </div>
          </div>

          {/* Commission Info */}
          <div className='bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8'>
            <h3 className='font-bold text-blue-900 mb-3 flex items-center gap-2'>
              <span>ℹ️</span> Comment fonctionne le partage des revenus ?
            </h3>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='bg-white rounded-xl p-4'>
                <p className='text-sm text-gray-600 mb-2'>Pour chaque vente de cours :</p>
                <div className='flex items-center gap-4'>
                  <div className='flex-1'>
                    <div className='h-4 rounded-full overflow-hidden flex'>
                      <div 
                        className='bg-green-500 flex items-center justify-center text-white text-xs font-bold'
                        style={{ width: `${earnings.educatorShareRate}%` }}
                      >
                        {earnings.educatorShareRate}%
                      </div>
                      <div 
                        className='bg-blue-500 flex items-center justify-center text-white text-xs font-bold'
                        style={{ width: `${earnings.commissionRate}%` }}
                      >
                        {earnings.commissionRate}%
                      </div>
                    </div>
                    <div className='flex justify-between mt-1 text-xs'>
                      <span className='text-green-600'>Vous</span>
                      <span className='text-blue-600'>Plateforme</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl p-4'>
                <p className='text-sm text-gray-600 mb-2'>Exemple pour un cours à {currency}100 :</p>
                <div className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span>Vous recevez :</span>
                    <span className='font-bold text-green-600'>{currency}{earnings.educatorShareRate}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Commission plateforme :</span>
                    <span className='font-bold text-blue-600'>{currency}{earnings.commissionRate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Request */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>💳 Demander un retrait</h2>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
              <div className='flex-1'>
                <p className='text-gray-600'>
                  Solde disponible : <span className='font-bold text-green-600'>{currency} {earnings.balance.toFixed(2)}</span>
                </p>
                <p className='text-sm text-gray-500'>
                  Montant minimum de retrait : {currency}{earnings.minPayout}
                </p>
              </div>
              <button
                disabled={!earnings.canRequestPayout}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  earnings.canRequestPayout
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => setShowPayoutModal(true)}
              >
                {earnings.canRequestPayout ? 'Demander un retrait' : 'Solde insuffisant'}
              </button>
            </div>
          </div>

          {/* Payout Requests History */}
          {payoutRequests.length > 0 && (
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>📜 Historique des retraits</h2>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-100'>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Date</th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Montant</th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Méthode</th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRequests.map((request) => (
                      <tr key={request._id} className='border-b border-gray-50 hover:bg-gray-50'>
                        <td className='py-3 px-4'>
                          <span className='text-gray-600 text-sm'>
                            {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <span className='font-bold text-gray-900'>{currency} {request.amount.toFixed(2)}</span>
                        </td>
                        <td className='py-3 px-4'>
                          <span className='text-gray-600'>
                            {request.paymentMethod === 'mobile_money' && `${request.mobileMoneyProvider?.toUpperCase()} - ${request.phoneNumber}`}
                            {request.paymentMethod === 'bank_transfer' && `${request.bankName} - ${request.accountNumber}`}
                            {request.paymentMethod === 'paypal' && request.paypalEmail}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
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
                          {request.adminNote && request.status === 'rejected' && (
                            <p className='text-xs text-red-500 mt-1'>{request.adminNote}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>📋 Transactions récentes</h2>
            {earnings.recentTransactions.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-100'>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Cours</th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Vente</th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Vos gains</th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.recentTransactions.map((tx) => (
                      <tr key={tx.id} className='border-b border-gray-50 hover:bg-gray-50'>
                        <td className='py-3 px-4'>
                          <span className='font-medium text-gray-900'>{tx.courseTitle}</span>
                        </td>
                        <td className='py-3 px-4'>
                          <span className='text-gray-600'>{currency} {tx.amount.toFixed(2)}</span>
                        </td>
                        <td className='py-3 px-4'>
                          <span className='font-bold text-green-600'>+{currency} {tx.educatorEarnings.toFixed(2)}</span>
                        </td>
                        <td className='py-3 px-4'>
                          <span className='text-gray-500 text-sm'>
                            {new Date(tx.date).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='text-center py-10 text-gray-500'>
                <span className='text-4xl mb-4 block'>📭</span>
                <p>Aucune transaction pour le moment</p>
                <p className='text-sm'>Vos ventes apparaîtront ici</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-100'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-bold text-gray-900'>💸 Demande de retrait</h2>
                <button 
                  onClick={() => setShowPayoutModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handlePayoutSubmit} className='p-6 space-y-4'>
              {/* Amount */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Montant à retirer ({currency})
                </label>
                <input
                  type='number'
                  min={earnings?.minPayout || 50}
                  max={earnings?.balance || 0}
                  step='0.01'
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder={`Min: ${earnings?.minPayout || 50}`}
                  required
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Disponible: {currency} {earnings?.balance?.toFixed(2)}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Méthode de paiement
                </label>
                <select
                  value={payoutForm.paymentMethod}
                  onChange={(e) => setPayoutForm({...payoutForm, paymentMethod: e.target.value})}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                >
                  <option value='mobile_money'>📱 Mobile Money</option>
                  <option value='bank_transfer'>🏦 Virement bancaire</option>
                  <option value='paypal'>💳 PayPal</option>
                </select>
              </div>

              {/* Mobile Money Fields */}
              {payoutForm.paymentMethod === 'mobile_money' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Fournisseur
                    </label>
                    <select
                      value={payoutForm.mobileMoneyProvider}
                      onChange={(e) => setPayoutForm({...payoutForm, mobileMoneyProvider: e.target.value})}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    >
                      <option value='mpesa'>M-Pesa</option>
                      <option value='orange_money'>Orange Money</option>
                      <option value='airtel_money'>Airtel Money</option>
                      <option value='mtn_money'>MTN Money</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Numéro de téléphone
                    </label>
                    <input
                      type='tel'
                      value={payoutForm.phoneNumber}
                      onChange={(e) => setPayoutForm({...payoutForm, phoneNumber: e.target.value})}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      placeholder='+243 XXX XXX XXX'
                      required
                    />
                  </div>
                </>
              )}

              {/* Bank Transfer Fields */}
              {payoutForm.paymentMethod === 'bank_transfer' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nom de la banque
                    </label>
                    <input
                      type='text'
                      value={payoutForm.bankName}
                      onChange={(e) => setPayoutForm({...payoutForm, bankName: e.target.value})}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      placeholder='Ex: Rawbank, Equity Bank...'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Numéro de compte
                    </label>
                    <input
                      type='text'
                      value={payoutForm.accountNumber}
                      onChange={(e) => setPayoutForm({...payoutForm, accountNumber: e.target.value})}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      placeholder='XXXX-XXXX-XXXX'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nom du titulaire
                    </label>
                    <input
                      type='text'
                      value={payoutForm.accountName}
                      onChange={(e) => setPayoutForm({...payoutForm, accountName: e.target.value})}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      placeholder='Nom complet'
                      required
                    />
                  </div>
                </>
              )}

              {/* PayPal Fields */}
              {payoutForm.paymentMethod === 'paypal' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email PayPal
                  </label>
                  <input
                    type='email'
                    value={payoutForm.paypalEmail}
                    onChange={(e) => setPayoutForm({...payoutForm, paypalEmail: e.target.value})}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    placeholder='email@paypal.com'
                    required
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className='pt-4'>
                <button
                  type='submit'
                  disabled={submitting}
                  className='w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400'
                >
                  {submitting ? '⏳ Envoi en cours...' : '✅ Soumettre la demande'}
                </button>
              </div>

              <p className='text-xs text-gray-500 text-center'>
                Votre demande sera traitée dans un délai de 1 à 3 jours ouvrables.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Earnings
