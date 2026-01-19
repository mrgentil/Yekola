import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import Loading from '../../components/student/Loading'

const AdminSiteSettings = () => {
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('identity')

  const [formData, setFormData] = useState({
    // Identity
    siteName: 'LearnHub',
    siteTagline: 'Votre parcours d\'apprentissage',
    siteLogo: '',
    siteFavicon: '',
    // Contact
    supportEmail: '',
    supportPhone: '',
    address: '',
    // Social
    socialFacebook: '',
    socialTwitter: '',
    socialLinkedin: '',
    socialYoutube: '',
    socialWhatsapp: '',
    // Hero Slides
    heroSlides: [
      { title: '', subtitle: '', image: '', buttonText: '', buttonLink: '' }
    ],
    // Sections
    showCompanies: true,
    showTrending: true,
    showTestimonials: true,
    // Footer
    footerAbout: '',
    copyrightText: '',
    // Mobile Money
    mpesaNumber: '',
    orangeMoneyNumber: '',
    airtelMoneyNumber: ''
  })

  const fetchSettings = async () => {
    try {
      const token = await getAccessToken()
      const { data } = await axios.get(`${backendUrl}/api/settings/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        const s = data.settings
        setFormData({
          siteName: s.siteName?.value || 'LearnHub',
          siteTagline: s.siteTagline?.value || '',
          siteLogo: s.siteLogo?.value || '',
          siteFavicon: s.siteFavicon?.value || '',
          supportEmail: s.supportEmail?.value || '',
          supportPhone: s.supportPhone?.value || '',
          address: s.address?.value || '',
          socialFacebook: s.socialFacebook?.value || '',
          socialTwitter: s.socialTwitter?.value || '',
          socialLinkedin: s.socialLinkedin?.value || '',
          socialYoutube: s.socialYoutube?.value || '',
          socialWhatsapp: s.socialWhatsapp?.value || '',
          heroSlides: Array.isArray(s.heroSlides?.value) && s.heroSlides.value.length > 0 
            ? s.heroSlides.value 
            : [{ title: '', subtitle: '', image: '', buttonText: '', buttonLink: '' }],
          showCompanies: s.showCompanies?.value ?? true,
          showTrending: s.showTrending?.value ?? true,
          showTestimonials: s.showTestimonials?.value ?? true,
          footerAbout: s.footerAbout?.value || '',
          copyrightText: s.copyrightText?.value || '',
          mpesaNumber: s.mpesaNumber?.value || '',
          orangeMoneyNumber: s.orangeMoneyNumber?.value || '',
          airtelMoneyNumber: s.airtelMoneyNumber?.value || ''
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
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addSlide = () => {
    setFormData({
      ...formData,
      heroSlides: [...formData.heroSlides, { title: '', subtitle: '', image: '', buttonText: '', buttonLink: '' }]
    })
  }

  const removeSlide = (index) => {
    if (formData.heroSlides.length > 1) {
      setFormData({
        ...formData,
        heroSlides: formData.heroSlides.filter((_, i) => i !== index)
      })
    }
  }

  const updateSlide = (index, field, value) => {
    const newSlides = [...formData.heroSlides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setFormData({ ...formData, heroSlides: newSlides })
  }

  // Upload image function
  const uploadImage = async (file, targetField, slideIndex = null) => {
    try {
      setUploading(true)
      const token = await getAccessToken()
      
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const { data } = await axios.post(`${backendUrl}/api/settings/upload-image`, formDataUpload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        if (slideIndex !== null) {
          updateSlide(slideIndex, 'image', data.imageUrl)
        } else {
          setFormData(prev => ({ ...prev, [targetField]: data.imageUrl }))
        }
        toast.success(`Image uploadée (${data.width}x${data.height}px)`)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e, targetField, slideIndex = null) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5 Mo')
        return
      }
      uploadImage(file, targetField, slideIndex)
    }
  }

  const tabs = [
    { id: 'identity', name: 'Identité', icon: '🏷️' },
    { id: 'hero', name: 'Slider Hero', icon: '🖼️' },
    { id: 'sections', name: 'Sections', icon: '📑' },
    { id: 'contact', name: 'Contact', icon: '📞' },
    { id: 'social', name: 'Réseaux sociaux', icon: '🌐' },
    { id: 'payment', name: 'Paiement', icon: '💳' },
    { id: 'footer', name: 'Footer', icon: '📄' }
  ]

  if (loading) return <Loading />

  return (
    <div className='p-6 md:p-8'>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-8'
      >
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>🎨 Personnalisation du site</h1>
        <p className='text-gray-500 mt-1'>Modifiez l'apparence et le contenu de votre plateforme</p>
      </motion.div>

      {/* Tabs */}
      <div className='flex flex-wrap gap-2 mb-8 bg-gray-100 p-2 rounded-xl'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className='hidden md:inline'>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'
      >
        {/* Identity Tab */}
        {activeTab === 'identity' && (
          <div className='space-y-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>🏷️ Identité du site</h2>
            
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nom du site
                </label>
                <input
                  type='text'
                  value={formData.siteName}
                  onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                  placeholder='LearnHub'
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Slogan
                </label>
                <input
                  type='text'
                  value={formData.siteTagline}
                  onChange={(e) => setFormData({...formData, siteTagline: e.target.value})}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                  placeholder="Votre parcours d'apprentissage"
                />
              </div>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Logo <span className='text-gray-400 text-xs'>(Taille recommandée: 200x60px)</span>
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={formData.siteLogo}
                    onChange={(e) => setFormData({...formData, siteLogo: e.target.value})}
                    className='flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                    placeholder='URL du logo ou uploadez'
                  />
                  <label className={`px-4 py-3 rounded-xl cursor-pointer flex items-center gap-2 transition-all ${uploading ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      disabled={uploading}
                      onChange={(e) => handleFileChange(e, 'siteLogo')}
                    />
                    {uploading ? '⏳' : '📤'}
                  </label>
                </div>
                {formData.siteLogo && (
                  <div className='mt-2 p-4 bg-gray-50 rounded-xl'>
                    <p className='text-xs text-gray-500 mb-2'>Aperçu:</p>
                    <img src={formData.siteLogo} alt='Logo' className='h-12 object-contain' />
                  </div>
                )}
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Favicon <span className='text-gray-400 text-xs'>(Taille recommandée: 32x32px)</span>
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={formData.siteFavicon}
                    onChange={(e) => setFormData({...formData, siteFavicon: e.target.value})}
                    className='flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                    placeholder='URL du favicon ou uploadez'
                  />
                  <label className={`px-4 py-3 rounded-xl cursor-pointer flex items-center gap-2 transition-all ${uploading ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      disabled={uploading}
                      onChange={(e) => handleFileChange(e, 'siteFavicon')}
                    />
                    {uploading ? '⏳' : '📤'}
                  </label>
                </div>
                {formData.siteFavicon && (
                  <div className='mt-2 p-4 bg-gray-50 rounded-xl'>
                    <p className='text-xs text-gray-500 mb-2'>Aperçu:</p>
                    <img src={formData.siteFavicon} alt='Favicon' className='h-8 object-contain' />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hero Slides Tab */}
        {activeTab === 'hero' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold text-gray-900'>🖼️ Slides du carrousel</h2>
              <button
                onClick={addSlide}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2'
              >
                <span>+</span> Ajouter un slide
              </button>
            </div>

            {formData.heroSlides.map((slide, index) => (
              <div key={index} className='bg-gray-50 rounded-xl p-6 relative'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-bold text-gray-700'>Slide {index + 1}</h3>
                  {formData.heroSlides.length > 1 && (
                    <button
                      onClick={() => removeSlide(index)}
                      className='text-red-500 hover:text-red-700'
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Titre</label>
                    <input
                      type='text'
                      value={slide.title}
                      onChange={(e) => updateSlide(index, 'title', e.target.value)}
                      className='w-full px-4 py-2 border border-gray-200 rounded-lg'
                      placeholder='Apprenez sans limites'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Sous-titre</label>
                    <input
                      type='text'
                      value={slide.subtitle}
                      onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                      className='w-full px-4 py-2 border border-gray-200 rounded-lg'
                      placeholder='Des milliers de cours...'
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Image du slide <span className='text-gray-400 text-xs'>(Taille recommandée: 1920x1080px, max 5Mo)</span>
                    </label>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        value={slide.image}
                        onChange={(e) => updateSlide(index, 'image', e.target.value)}
                        className='flex-1 px-4 py-2 border border-gray-200 rounded-lg'
                        placeholder="URL de l'image ou uploadez"
                      />
                      <label className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all ${uploading ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        <input
                          type='file'
                          accept='image/*'
                          className='hidden'
                          disabled={uploading}
                          onChange={(e) => handleFileChange(e, null, index)}
                        />
                        {uploading ? '⏳' : '📤'} {uploading ? 'Upload...' : 'Upload'}
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Texte du bouton</label>
                    <input
                      type='text'
                      value={slide.buttonText}
                      onChange={(e) => updateSlide(index, 'buttonText', e.target.value)}
                      className='w-full px-4 py-2 border border-gray-200 rounded-lg'
                      placeholder='Explorer les cours'
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Lien du bouton</label>
                    <input
                      type='text'
                      value={slide.buttonLink}
                      onChange={(e) => updateSlide(index, 'buttonLink', e.target.value)}
                      className='w-full px-4 py-2 border border-gray-200 rounded-lg'
                      placeholder='/course-list'
                    />
                  </div>
                </div>

                {slide.image && (
                  <div className='mt-4'>
                    <p className='text-xs text-gray-500 mb-2'>Aperçu de l'image:</p>
                    <img src={slide.image} alt='Slide' className='h-32 object-cover rounded-lg' />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className='space-y-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>📑 Sections de la page d'accueil</h2>
            
            <div className='space-y-4'>
              {[
                { key: 'showCompanies', label: 'Section Entreprises partenaires', desc: 'Affiche les logos des entreprises' },
                { key: 'showTrending', label: 'Section Cours tendances', desc: 'Affiche les cours populaires' },
                { key: 'showTestimonials', label: 'Section Témoignages', desc: 'Affiche les avis des étudiants' }
              ].map(section => (
                <div key={section.key} className='flex items-center justify-between p-4 bg-gray-50 rounded-xl'>
                  <div>
                    <p className='font-medium text-gray-900'>{section.label}</p>
                    <p className='text-sm text-gray-500'>{section.desc}</p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={formData[section.key]}
                      onChange={(e) => setFormData({...formData, [section.key]: e.target.checked})}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className='space-y-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>📞 Informations de contact</h2>
            
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Email de support</label>
                <input
                  type='email'
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl'
                  placeholder='support@learnhub.com'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Téléphone</label>
                <input
                  type='text'
                  value={formData.supportPhone}
                  onChange={(e) => setFormData({...formData, supportPhone: e.target.value})}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl'
                  placeholder='+243 XXX XXX XXX'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Adresse</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl'
                  rows={2}
                  placeholder='Kinshasa, RDC'
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className='space-y-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>🌐 Réseaux sociaux</h2>
            
            <div className='grid md:grid-cols-2 gap-6'>
              {[
                { key: 'socialFacebook', label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/...' },
                { key: 'socialTwitter', label: 'Twitter / X', icon: '🐦', placeholder: 'https://twitter.com/...' },
                { key: 'socialLinkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/...' },
                { key: 'socialYoutube', label: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/...' },
                { key: 'socialWhatsapp', label: 'WhatsApp', icon: '💬', placeholder: '+243 XXX XXX XXX' }
              ].map(social => (
                <div key={social.key}>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {social.icon} {social.label}
                  </label>
                  <input
                    type='text'
                    value={formData[social.key]}
                    onChange={(e) => setFormData({...formData, [social.key]: e.target.value})}
                    className='w-full px-4 py-3 border border-gray-200 rounded-xl'
                    placeholder={social.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className='space-y-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>💳 Numéros Mobile Money</h2>
            <p className='text-gray-500 text-sm mb-4'>Ces numéros seront affichés aux étudiants lors du paiement</p>
            
            <div className='grid md:grid-cols-3 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>📱 M-Pesa</label>
                <input
                  type='text'
                  value={formData.mpesaNumber}
                  onChange={(e) => setFormData({...formData, mpesaNumber: e.target.value})}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl'
                  placeholder='+243 XXX XXX XXX'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>🟠 Orange Money</label>
                <input
                  type='text'
                  value={formData.orangeMoneyNumber}
                  onChange={(e) => setFormData({...formData, orangeMoneyNumber: e.target.value})}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl'
                  placeholder='+243 XXX XXX XXX'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>🔴 Airtel Money</label>
                <input
                  type='text'
                  value={formData.airtelMoneyNumber}
                  onChange={(e) => setFormData({...formData, airtelMoneyNumber: e.target.value})}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl'
                  placeholder='+243 XXX XXX XXX'
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === 'footer' && (
          <div className='space-y-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>📄 Pied de page</h2>
            
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Texte "À propos"</label>
              <textarea
                value={formData.footerAbout}
                onChange={(e) => setFormData({...formData, footerAbout: e.target.value})}
                className='w-full px-4 py-3 border border-gray-200 rounded-xl'
                rows={3}
                placeholder="YekolaLMS révolutionne l'éducation..."
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Texte de copyright</label>
              <input
                type='text'
                value={formData.copyrightText}
                onChange={(e) => setFormData({...formData, copyrightText: e.target.value})}
                className='w-full px-4 py-3 border border-gray-200 rounded-xl'
                placeholder='© 2025 LearnHub. Tous droits réservés.'
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mt-8 flex justify-end'
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className='px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50'
        >
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder les modifications'}
        </button>
      </motion.div>
    </div>
  )
}

export default AdminSiteSettings
