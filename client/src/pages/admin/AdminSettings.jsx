import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import Loading from '../../components/student/Loading'

const AdminSettings = () => {
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    platformCommission: 20,
    educatorShare: 80,
    minPayout: 50,
    siteName: 'LearnHub',
    supportEmail: 'support@learnhub.com',
    currency: 'USD'
  })

  const fetchSettings = async () => {
    try {
      const token = await getAccessToken()
      const { data } = await axios.get(`${backendUrl}/api/settings/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setSettings(data.settings)
        setFormData({
          platformCommission: data.settings.platformCommission?.value || 20,
          educatorShare: data.settings.educatorShare?.value || 80,
          minPayout: data.settings.minPayout?.value || 50,
          siteName: data.settings.siteName?.value || 'LearnHub',
          supportEmail: data.settings.supportEmail?.value || 'support@learnhub.com',
          currency: data.settings.currency?.value || 'USD'
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleCommissionChange = (value) => {
    const commission = Math.min(100, Math.max(0, parseInt(value) || 0))
    setFormData({
      ...formData,
      platformCommission: commission,
      educatorShare: 100 - commission
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = await getAccessToken()
      
      const { data } = await axios.put(`${backendUrl}/api/settings`, {
        settings: formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success('Paramètres sauvegardés !')
        fetchSettings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className='p-6 md:p-8'>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-8'
      >
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>⚙️ Paramètres de la plateforme</h1>
        <p className='text-gray-500 mt-1'>Configurez les commissions et paramètres généraux</p>
      </motion.div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Commission Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'
        >
          <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
            💰 Partage des revenus
          </h2>

          {/* Visual Commission Split */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-600'>Répartition des revenus</span>
            </div>
            <div className='h-8 rounded-full overflow-hidden flex'>
              <div 
                className='bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold transition-all duration-300'
                style={{ width: `${formData.platformCommission}%` }}
              >
                {formData.platformCommission > 10 && `${formData.platformCommission}%`}
              </div>
              <div 
                className='bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-300'
                style={{ width: `${formData.educatorShare}%` }}
              >
                {formData.educatorShare > 10 && `${formData.educatorShare}%`}
              </div>
            </div>
            <div className='flex justify-between mt-2 text-xs'>
              <span className='text-blue-600 font-medium'>🏢 Plateforme</span>
              <span className='text-green-600 font-medium'>👨‍🏫 Éducateur</span>
            </div>
          </div>

          {/* Commission Slider */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Commission de la plateforme
            </label>
            <div className='flex items-center gap-4'>
              <input
                type='range'
                min='0'
                max='100'
                value={formData.platformCommission}
                onChange={(e) => handleCommissionChange(e.target.value)}
                className='flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600'
              />
              <div className='flex items-center gap-1'>
                <input
                  type='number'
                  min='0'
                  max='100'
                  value={formData.platformCommission}
                  onChange={(e) => handleCommissionChange(e.target.value)}
                  className='w-16 px-2 py-1 border border-gray-200 rounded-lg text-center font-bold'
                />
                <span className='text-gray-500'>%</span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-blue-50 rounded-xl p-4 border border-blue-100'>
              <p className='text-xs text-blue-600 font-medium mb-1'>Commission plateforme</p>
              <p className='text-2xl font-bold text-blue-700'>{formData.platformCommission}%</p>
              <p className='text-xs text-blue-500 mt-1'>Sur chaque vente</p>
            </div>
            <div className='bg-green-50 rounded-xl p-4 border border-green-100'>
              <p className='text-xs text-green-600 font-medium mb-1'>Part éducateur</p>
              <p className='text-2xl font-bold text-green-700'>{formData.educatorShare}%</p>
              <p className='text-xs text-green-500 mt-1'>Revenus nets</p>
            </div>
          </div>

          {/* Example */}
          <div className='mt-6 bg-gray-50 rounded-xl p-4'>
            <p className='text-sm font-medium text-gray-700 mb-2'>📊 Exemple de calcul</p>
            <p className='text-xs text-gray-500'>Pour un cours vendu à <span className='font-bold'>100$</span> :</p>
            <div className='flex justify-between mt-2 text-sm'>
              <span>Plateforme reçoit :</span>
              <span className='font-bold text-blue-600'>${formData.platformCommission}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Éducateur reçoit :</span>
              <span className='font-bold text-green-600'>${formData.educatorShare}</span>
            </div>
          </div>
        </motion.div>

        {/* Payout Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'
        >
          <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
            💳 Paramètres de paiement
          </h2>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Montant minimum de retrait
              </label>
              <div className='flex items-center gap-2'>
                <span className='text-gray-500'>$</span>
                <input
                  type='number'
                  min='0'
                  value={formData.minPayout}
                  onChange={(e) => setFormData({...formData, minPayout: parseInt(e.target.value) || 0})}
                  className='flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <p className='text-xs text-gray-500 mt-1'>Les éducateurs doivent atteindre ce montant pour demander un retrait</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Devise principale
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
              >
                <option value='USD'>USD ($)</option>
                <option value='EUR'>EUR (€)</option>
                <option value='XAF'>XAF (FCFA)</option>
                <option value='XOF'>XOF (FCFA)</option>
              </select>
            </div>
          </div>

          <h2 className='text-xl font-bold text-gray-900 mt-8 mb-6 flex items-center gap-2'>
            🌐 Paramètres généraux
          </h2>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Nom du site
              </label>
              <input
                type='text'
                value={formData.siteName}
                onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Email de support
              </label>
              <input
                type='email'
                value={formData.supportEmail}
                onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
                className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='mt-8 flex justify-end'
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className='px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50'
        >
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder les paramètres'}
        </button>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6'
      >
        <h3 className='font-bold text-blue-900 mb-2'>ℹ️ Comment fonctionne le partage des revenus ?</h3>
        <ul className='text-sm text-blue-700 space-y-2'>
          <li>• Quand un étudiant achète un cours, le montant est divisé selon les pourcentages définis</li>
          <li>• La <strong>commission plateforme</strong> est votre revenu en tant qu'administrateur</li>
          <li>• La <strong>part éducateur</strong> est créditée sur le compte de l'instructeur</li>
          <li>• Les éducateurs peuvent demander un retrait quand ils atteignent le montant minimum</li>
        </ul>
      </motion.div>
    </div>
  )
}

export default AdminSettings
