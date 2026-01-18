import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import Loading from '../../components/student/Loading'

const AdminCoupons = () => {
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: 0,
    maxDiscount: '',
    validUntil: '',
    usageLimit: ''
  })

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const token = await getAccessToken()
      const { data } = await axios.get(`${backendUrl}/api/coupon/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setCoupons(data.coupons)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = await getAccessToken()
      
      if (editingCoupon) {
        const { data } = await axios.put(
          `${backendUrl}/api/coupon/${editingCoupon._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (data.success) {
          toast.success('Coupon mis à jour')
        }
      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/coupon/create`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (data.success) {
          toast.success('Coupon créé')
        }
      }
      
      setShowModal(false)
      setEditingCoupon(null)
      resetForm()
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (couponId) => {
    if (!window.confirm('Supprimer ce coupon ?')) return
    try {
      const token = await getAccessToken()
      const { data } = await axios.delete(`${backendUrl}/api/coupon/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        toast.success('Coupon supprimé')
        fetchCoupons()
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggle = async (couponId) => {
    try {
      const token = await getAccessToken()
      const { data } = await axios.patch(
        `${backendUrl}/api/coupon/${couponId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        fetchCoupons()
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: 0,
      maxDiscount: '',
      validUntil: '',
      usageLimit: ''
    })
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || '',
      validUntil: coupon.validUntil?.split('T')[0] || '',
      usageLimit: coupon.usageLimit || ''
    })
    setShowModal(true)
  }

  if (loading) return <Loading />

  return (
    <div className='p-6 md:p-8'>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col md:flex-row md:items-center md:justify-between mb-8'
      >
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Gestion des coupons</h1>
          <p className='text-gray-500 mt-1'>{coupons.length} codes promo</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingCoupon(null); setShowModal(true); }}
          className='mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all'
        >
          + Nouveau coupon
        </button>
      </motion.div>

      {/* Coupons Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AnimatePresence>
          {coupons.map((coupon, index) => {
            const isExpired = new Date(coupon.validUntil) < new Date()
            const isActive = coupon.isActive && !isExpired
            
            return (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                  isActive ? 'border-green-200' : 'border-gray-200 opacity-75'
                }`}
              >
                {/* Header */}
                <div className={`p-4 ${isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-400'}`}>
                  <div className='flex items-center justify-between'>
                    <span className='text-2xl font-bold text-white tracking-wider'>
                      {coupon.code}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/30 text-white'
                    }`}>
                      {isExpired ? 'Expiré' : isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className='p-4'>
                  <div className='flex items-center justify-center mb-4'>
                    <span className='text-4xl font-bold text-gray-900'>
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                    </span>
                    <span className='ml-2 text-gray-500'>de réduction</span>
                  </div>

                  <div className='space-y-2 text-sm'>
                    {coupon.minPurchase > 0 && (
                      <div className='flex justify-between text-gray-600'>
                        <span>Achat min.</span>
                        <span className='font-medium'>${coupon.minPurchase}</span>
                      </div>
                    )}
                    {coupon.maxDiscount && (
                      <div className='flex justify-between text-gray-600'>
                        <span>Réduction max.</span>
                        <span className='font-medium'>${coupon.maxDiscount}</span>
                      </div>
                    )}
                    <div className='flex justify-between text-gray-600'>
                      <span>Utilisations</span>
                      <span className='font-medium'>
                        {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ' (illimité)'}
                      </span>
                    </div>
                    <div className='flex justify-between text-gray-600'>
                      <span>Expire le</span>
                      <span className='font-medium'>
                        {new Date(coupon.validUntil).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 mt-4 pt-4 border-t border-gray-100'>
                    <button
                      onClick={() => handleToggle(coupon._id)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        coupon.isActive 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {coupon.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => openEditModal(coupon)}
                      className='flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors'
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className='px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors'
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {coupons.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-6xl mb-4'>🎟️</div>
          <p className='text-gray-500'>Aucun coupon créé</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto'
          >
            <h3 className='text-xl font-bold text-gray-900 mb-6'>
              {editingCoupon ? 'Modifier le coupon' : 'Nouveau coupon'}
            </h3>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Code promo</label>
                <input
                  type='text'
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder='PROMO2024'
                  className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='percentage'>Pourcentage (%)</option>
                    <option value='fixed'>Montant fixe ($)</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Valeur</label>
                  <input
                    type='number'
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    placeholder={formData.discountType === 'percentage' ? '20' : '10'}
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                    required
                    min='0'
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Achat minimum ($)</label>
                  <input
                    type='number'
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                    placeholder='0'
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                    min='0'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Réduction max ($)</label>
                  <input
                    type='number'
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    placeholder='Illimité'
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                    min='0'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Date d'expiration</label>
                  <input
                    type='date'
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Limite d'usage</label>
                  <input
                    type='number'
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                    placeholder='Illimité'
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                    min='1'
                  />
                </div>
              </div>

              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => { setShowModal(false); setEditingCoupon(null); }}
                  className='flex-1 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors'
                >
                  Annuler
                </button>
                <button
                  type='submit'
                  className='flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all'
                >
                  {editingCoupon ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminCoupons
