import React, { useContext, useState, useRef } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { motion } from 'framer-motion'

const AddCourse = () => {
    const { backendUrl, getAccessToken } = useContext(AppContext)
    const [courseData, setCourseData] = useState({
        courseTitle: '',
        courseDescription: '',
        coursePrice: '',
        discount: '',
        courseThumbnail: '',
        courseContent: [],
        playlistLink: ''
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const fileInputRef = useRef(null)
    const navigate = useNavigate()

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = await getAccessToken();
            if (!token) {
                toast.error('Authentification requise')
                return
            }

            const formData = new FormData()
            formData.append('image', imageFile)
            formData.append('courseData', JSON.stringify(courseData))

            const { data } = await axios.post(`${backendUrl}/api/educator/add-course`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            })

            if (data.success) {
                toast.success(data.message)
                navigate('/educator')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { id: 1, title: 'Informations', icon: '📝' },
        { id: 2, title: 'Tarification', icon: '💰' },
        { id: 3, title: 'Médias', icon: '🖼️' },
    ]

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const finalPrice = courseData.coursePrice && courseData.discount 
        ? (courseData.coursePrice - (courseData.coursePrice * courseData.discount / 100)).toFixed(2)
        : courseData.coursePrice || '0'

    return (
        <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Créer un nouveau cours</h1>
                <p className='text-gray-500 mt-1'>Remplissez les informations pour créer votre cours</p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <motion.div 
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl cursor-pointer transition-all ${
                                        currentStep >= step.id 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {step.icon}
                                </motion.div>
                                <span className={`text-sm mt-2 font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {step.title}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </motion.div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-4xl mx-auto"
            >
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-6 md:p-8 space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Titre du cours <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder='Ex: Maîtrisez React.js de A à Z'
                                        value={courseData.courseTitle}
                                        onChange={(e) => setCourseData({...courseData, courseTitle: e.target.value})}
                                        className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none' 
                                        required 
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Un titre accrocheur attire plus d'étudiants</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        placeholder='Décrivez votre cours en détail...'
                                        value={courseData.courseDescription}
                                        onChange={(e) => setCourseData({...courseData, courseDescription: e.target.value})}
                                        className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none h-40 resize-none' 
                                        required 
                                    />
                                    <p className="text-xs text-gray-400 mt-1">{courseData.courseDescription.length}/500 caractères</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Lien YouTube Playlist (Optionnel)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                                <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                            </svg>
                                        </span>
                                        <input 
                                            type="url" 
                                            placeholder='https://www.youtube.com/playlist?list=...'
                                            value={courseData.playlistLink}
                                            onChange={(e) => setCourseData({...courseData, playlistLink: e.target.value})}
                                            className='w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none' 
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Pricing */}
                        {currentStep === 2 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-6 md:p-8 space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Prix du cours (USD) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                                            <input 
                                                type="number" 
                                                placeholder='0.00'
                                                min="0"
                                                step="0.01"
                                                value={courseData.coursePrice}
                                                onChange={(e) => setCourseData({...courseData, coursePrice: e.target.value})}
                                                className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none' 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Réduction (%)
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                placeholder='0'
                                                min="0"
                                                max="100"
                                                value={courseData.discount}
                                                onChange={(e) => setCourseData({...courseData, discount: e.target.value})}
                                                className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none pr-10' 
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Preview */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Aperçu du prix</h3>
                                    <div className="flex items-end gap-4">
                                        <div>
                                            <p className="text-3xl font-bold text-gray-900">${finalPrice}</p>
                                            <p className="text-sm text-gray-500">Prix final</p>
                                        </div>
                                        {courseData.discount > 0 && (
                                            <>
                                                <div className="text-gray-400 line-through text-lg">${courseData.coursePrice}</div>
                                                <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                                                    -{courseData.discount}%
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Media */}
                        {currentStep === 3 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-6 md:p-8 space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Image de couverture <span className="text-red-500">*</span>
                                    </label>
                                    
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/50 ${
                                            imagePreview ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'
                                        }`}
                                    >
                                        <input 
                                            ref={fileInputRef}
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className='hidden' 
                                            required={!imageFile}
                                        />
                                        
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-lg" />
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-gray-700 font-medium">Cliquez pour télécharger</p>
                                                    <p className="text-gray-400 text-sm">PNG, JPG jusqu'à 10MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Course Summary */}
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Résumé du cours</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Titre</span>
                                            <span className="font-medium text-gray-900 truncate max-w-xs">{courseData.courseTitle || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Prix</span>
                                            <span className="font-medium text-gray-900">${finalPrice}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Playlist</span>
                                            <span className="font-medium text-gray-900">{courseData.playlistLink ? '✓ Ajoutée' : 'Non'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="px-6 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Précédent
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                                >
                                    Suivant
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="px-8 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-600/30 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Créer le cours
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default AddCourse
