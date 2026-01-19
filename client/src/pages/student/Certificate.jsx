import React, { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../components/student/Loading'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const Certificate = () => {
  const { certificateId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const certificateRef = useRef(null)

  const fetchCertificate = async () => {
    try {
      const token = await getAccessToken()
      if (!token) {
        navigate('/signin')
        return
      }

      const { data } = await axios.get(`${backendUrl}/api/certificate/${certificateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setCertificate(data.certificate)
      } else {
        toast.error(data.message)
        navigate('/my-enrollments')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du certificat')
      navigate('/my-enrollments')
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async () => {
    if (!certificateRef.current) return
    setDownloading(true)

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Certificat_${certificate.certificateNumber}.pdf`)

      // Mark as downloaded
      const token = await getAccessToken()
      await axios.post(`${backendUrl}/api/certificate/downloaded/${certificateId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Certificat téléchargé avec succès !')
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    fetchCertificate()
  }, [certificateId])

  if (loading) return <Loading />

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Certificat non trouvé</p>
      </div>
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            ← Retour
          </button>
          <div className="flex gap-3">
            <button
              onClick={downloadCertificate}
              disabled={downloading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              {downloading ? (
                <>⏳ Génération...</>
              ) : (
                <>📥 Télécharger PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div
            ref={certificateRef}
            className="aspect-[297/210] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 relative"
            style={{ minHeight: '500px' }}
          >
            {/* Border decoration */}
            <div className="absolute inset-4 border-4 border-double border-blue-200 rounded-lg pointer-events-none"></div>
            <div className="absolute inset-6 border border-blue-100 rounded-lg pointer-events-none"></div>

            {/* Corner decorations */}
            <div className="absolute top-8 left-8 text-4xl opacity-20">🎓</div>
            <div className="absolute top-8 right-8 text-4xl opacity-20">🏆</div>
            <div className="absolute bottom-8 left-8 text-4xl opacity-20">⭐</div>
            <div className="absolute bottom-8 right-8 text-4xl opacity-20">📚</div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-12">
              {/* Logo/Header */}
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-3xl text-white">🎓</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LearnHub
                </h1>
              </div>

              {/* Certificate Title */}
              <h2 className="text-2xl font-serif text-gray-600 mb-2">CERTIFICAT DE RÉUSSITE</h2>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-6"></div>

              {/* This certifies */}
              <p className="text-gray-500 mb-2">Ce certificat est décerné à</p>

              {/* Student Name */}
              <h3 className="text-4xl font-bold text-gray-800 mb-4 font-serif">
                {certificate.studentName}
              </h3>

              {/* Course completion */}
              <p className="text-gray-500 mb-2">pour avoir complété avec succès le cours</p>

              {/* Course Title */}
              <h4 className="text-2xl font-semibold text-blue-700 mb-6 max-w-lg">
                {certificate.courseTitle}
              </h4>

              {/* Details */}
              <div className="flex items-center gap-8 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <span>📚</span>
                  <span>{certificate.totalLectures} leçons</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{Math.round(certificate.totalDuration / 60)} heures</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{formatDate(certificate.completedAt)}</span>
                </div>
              </div>

              {/* Signature area */}
              <div className="flex justify-between w-full max-w-2xl mt-4">
                <div className="text-center">
                  <div className="w-40 border-b-2 border-gray-300 mb-2"></div>
                  <p className="text-sm text-gray-500">Instructeur</p>
                  <p className="font-medium text-gray-700">{certificate.educatorName}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">✅</div>
                  <p className="text-xs text-gray-400">Vérifié</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b-2 border-gray-300 mb-2"></div>
                  <p className="text-sm text-gray-500">LearnHub</p>
                  <p className="font-medium text-gray-700">Plateforme E-Learning</p>
                </div>
              </div>

              {/* Certificate number */}
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                <p className="text-xs text-gray-400">
                  Certificat N° {certificate.certificateNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification info */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">🔐 Vérification du certificat</h3>
          <p className="text-sm text-gray-600 mb-2">
            Ce certificat peut être vérifié en utilisant le numéro unique :
          </p>
          <div className="bg-gray-100 rounded-lg p-3 font-mono text-center text-lg">
            {certificate.certificateNumber}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Vérifiez sur : {window.location.origin}/verify/{certificate.certificateNumber}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Certificate
