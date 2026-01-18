import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const SiteContext = createContext()

export const SiteContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'LearnHub',
    siteTagline: 'Votre parcours d\'apprentissage',
    siteLogo: '',
    siteFavicon: '',
    supportEmail: '',
    supportPhone: '',
    address: '',
    socialFacebook: '',
    socialTwitter: '',
    socialLinkedin: '',
    socialYoutube: '',
    socialWhatsapp: '',
    heroSlides: [],
    showCompanies: true,
    showTrending: true,
    showTestimonials: true,
    footerAbout: '',
    copyrightText: '',
    mpesaNumber: '',
    orangeMoneyNumber: '',
    airtelMoneyNumber: '',
    currency: 'USD'
  })
  
  const [loading, setLoading] = useState(true)

  const fetchSiteSettings = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/settings/public`)
      if (data.success) {
        setSiteSettings(prev => ({
          ...prev,
          ...data.settings
        }))
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSiteSettings()
  }, [])

  // Update document title when siteName changes
  useEffect(() => {
    if (siteSettings.siteName) {
      document.title = siteSettings.siteName
    }
  }, [siteSettings.siteName])

  const value = {
    siteSettings,
    setSiteSettings,
    loading,
    refreshSettings: fetchSiteSettings
  }

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  )
}
