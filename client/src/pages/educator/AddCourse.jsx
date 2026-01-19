import React, { useContext, useState, useRef } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import uniqid from 'uniqid'

const AddCourse = () => {
    const { backendUrl, getAccessToken } = useContext(AppContext)
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef(null)
    const navigate = useNavigate()

    // Course basic info
    const [courseTitle, setCourseTitle] = useState('')
    const [courseDescription, setCourseDescription] = useState('')
    const [category, setCategory] = useState('development')
    const [level, setLevel] = useState('all')
    const [language, setLanguage] = useState('Français')
    
    // Pricing
    const [coursePrice, setCoursePrice] = useState('')
    const [discount, setDiscount] = useState('')
    
    // Media
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [previewVideo, setPreviewVideo] = useState('')
    const [playlistLink, setPlaylistLink] = useState('')
    
    // Curriculum
    const [chapters, setChapters] = useState([])

    const categories = [
        { id: 'development', label: 'Développement' },
        { id: 'business', label: 'Business' },
        { id: 'design', label: 'Design' },
        { id: 'marketing', label: 'Marketing' },
        { id: 'photography', label: 'Photographie' },
        { id: 'music', label: 'Musique' },
        { id: 'health', label: 'Santé & Fitness' },
        { id: 'finance', label: 'Finance' },
        { id: 'lifestyle', label: 'Lifestyle' },
        { id: 'other', label: 'Autre' }
    ]

    const levels = [
        { id: 'all', label: 'Tous niveaux' },
        { id: 'beginner', label: 'Débutant' },
        { id: 'intermediate', label: 'Intermédiaire' },
        { id: 'advanced', label: 'Avancé' }
    ]

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result)
            reader.readAsDataURL(file)
        }
    }

    // Chapter management
    const addChapter = () => {
        setChapters([...chapters, {
            chapterId: uniqid(),
            chapterTitle: '',
            chapterOrder: chapters.length,
            chapterContent: [],
            collapsed: false
        }])
    }

    const updateChapter = (index, field, value) => {
        const newChapters = [...chapters]
        newChapters[index][field] = value
        setChapters(newChapters)
    }

    const removeChapter = (index) => {
        setChapters(chapters.filter((_, i) => i !== index))
    }

    const toggleChapter = (index) => {
        const newChapters = [...chapters]
        newChapters[index].collapsed = !newChapters[index].collapsed
        setChapters(newChapters)
    }

    // Lecture management
    const addLecture = (chapterIndex) => {
        const newChapters = [...chapters]
        newChapters[chapterIndex].chapterContent.push({
            lectureId: uniqid(),
            lectureTitle: '',
            lectureUrl: '',
            lectureDuration: 0,
            lectureOrder: newChapters[chapterIndex].chapterContent.length,
            isPreviewFree: false
        })
        setChapters(newChapters)
    }

    const updateLecture = (chapterIndex, lectureIndex, field, value) => {
        const newChapters = [...chapters]
        newChapters[chapterIndex].chapterContent[lectureIndex][field] = value
        setChapters(newChapters)
    }

    const removeLecture = (chapterIndex, lectureIndex) => {
        const newChapters = [...chapters]
        newChapters[chapterIndex].chapterContent = newChapters[chapterIndex].chapterContent.filter((_, i) => i !== lectureIndex)
        setChapters(newChapters)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!courseTitle.trim()) {
            toast.error('Le titre du cours est requis')
            setCurrentStep(1)
            return
        }
        if (!courseDescription.trim()) {
            toast.error('La description est requise')
            setCurrentStep(1)
            return
        }
        if (!imageFile) {
            toast.error('L\'image de couverture est requise')
            setCurrentStep(4)
            return
        }
        if (chapters.length === 0) {
            toast.error('Ajoutez au moins un chapitre')
            setCurrentStep(3)
            return
        }

        setLoading(true)

        try {
            const token = await getAccessToken()
            if (!token) {
                toast.error('Authentification requise')
                return
            }

            const courseData = {
                courseTitle,
                courseDescription,
                coursePrice: coursePrice || 0,
                discount: discount || 0,
                category,
                level,
                language,
                previewVideo,
                playlistLink,
                courseContent: chapters.map((ch, i) => ({
                    ...ch,
                    chapterOrder: i,
                    chapterContent: ch.chapterContent.map((lec, j) => ({
                        ...lec,
                        lectureOrder: j
                    }))
                }))
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
                toast.success('Cours créé avec succès !')
                navigate('/educator/my-courses')
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
        { id: 3, title: 'Curriculum', icon: '📚' },
        { id: 4, title: 'Médias', icon: '🖼️' },
    ]

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const finalPrice = coursePrice && discount 
        ? (coursePrice - (coursePrice * discount / 100)).toFixed(2)
        : coursePrice || '0'

    const totalLectures = chapters.reduce((acc, ch) => acc + ch.chapterContent.length, 0)
    const totalDuration = chapters.reduce((acc, ch) => 
        acc + ch.chapterContent.reduce((a, l) => a + (parseFloat(l.lectureDuration) || 0), 0), 0)

    return (
        <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
            {/* Header */}
            <div className="mb-8">
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Créer un nouveau cours</h1>
                <p className='text-gray-500 mt-1'>Ajoutez les informations de votre cours étape par étape</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <div 
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl cursor-pointer transition-all ${
                                        currentStep >= step.id 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {step.icon}
                                </div>
                                <span className={`text-xs mt-2 font-medium hidden sm:block ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {step.title}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="p-6 md:p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Titre du cours <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder='Ex: Maîtrisez React.js de A à Z'
                                        value={courseTitle}
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none' 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        placeholder='Décrivez ce que les étudiants vont apprendre...'
                                        value={courseDescription}
                                        onChange={(e) => setCourseDescription(e.target.value)}
                                        className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-32 resize-none' 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                                        <select 
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none'
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau</label>
                                        <select 
                                            value={level}
                                            onChange={(e) => setLevel(e.target.value)}
                                            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none'
                                        >
                                            {levels.map(lvl => (
                                                <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Langue</label>
                                        <select 
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none'
                                        >
                                            <option value="Français">Français</option>
                                            <option value="English">English</option>
                                            <option value="Español">Español</option>
                                            <option value="العربية">العربية</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Pricing */}
                        {currentStep === 2 && (
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Prix (USD) <span className="text-gray-400 font-normal">- Mettez 0 pour gratuit</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                                            <input 
                                                type="number" 
                                                placeholder='0'
                                                min="0"
                                                value={coursePrice}
                                                onChange={(e) => setCoursePrice(e.target.value)}
                                                className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none' 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Réduction (%)</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                placeholder='0'
                                                min="0"
                                                max="100"
                                                value={discount}
                                                onChange={(e) => setDiscount(e.target.value)}
                                                className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none pr-10' 
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Prix final pour les étudiants</p>
                                            <p className="text-3xl font-bold text-gray-900">${finalPrice}</p>
                                        </div>
                                        {discount > 0 && (
                                            <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                                                -{discount}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Curriculum */}
                        {currentStep === 3 && (
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Curriculum du cours</h3>
                                        <p className="text-sm text-gray-500">{chapters.length} chapitres • {totalLectures} leçons • {totalDuration} min</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addChapter}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                    >
                                        + Ajouter un chapitre
                                    </button>
                                </div>

                                {chapters.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <div className="text-4xl mb-3">📚</div>
                                        <p className="text-gray-600 font-medium">Aucun chapitre ajouté</p>
                                        <p className="text-gray-400 text-sm mb-4">Commencez par ajouter votre premier chapitre</p>
                                        <button
                                            type="button"
                                            onClick={addChapter}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            + Ajouter un chapitre
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {chapters.map((chapter, chapterIndex) => (
                                            <div key={chapter.chapterId} className="border border-gray-200 rounded-xl overflow-hidden">
                                                {/* Chapter Header */}
                                                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleChapter(chapterIndex)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            {chapter.collapsed ? '▶' : '▼'}
                                                        </button>
                                                        <span className="text-sm font-medium text-gray-500">Chapitre {chapterIndex + 1}</span>
                                                        <input
                                                            type="text"
                                                            value={chapter.chapterTitle}
                                                            onChange={(e) => updateChapter(chapterIndex, 'chapterTitle', e.target.value)}
                                                            placeholder="Titre du chapitre..."
                                                            className="flex-1 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChapter(chapterIndex)}
                                                        className="text-red-500 hover:text-red-700 ml-2"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>

                                                {/* Chapter Content (Lectures) */}
                                                {!chapter.collapsed && (
                                                    <div className="p-4 space-y-3">
                                                        {chapter.chapterContent.map((lecture, lectureIndex) => (
                                                            <div key={lecture.lectureId} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                                                                <span className="text-gray-400 text-sm">{chapterIndex + 1}.{lectureIndex + 1}</span>
                                                                <input
                                                                    type="text"
                                                                    value={lecture.lectureTitle}
                                                                    onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'lectureTitle', e.target.value)}
                                                                    placeholder="Titre de la leçon"
                                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                                />
                                                                <input
                                                                    type="url"
                                                                    value={lecture.lectureUrl}
                                                                    onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'lectureUrl', e.target.value)}
                                                                    placeholder="URL YouTube"
                                                                    className="w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={lecture.lectureDuration}
                                                                    onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'lectureDuration', e.target.value)}
                                                                    placeholder="Min"
                                                                    min="0"
                                                                    className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                                                />
                                                                <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={lecture.isPreviewFree}
                                                                        onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'isPreviewFree', e.target.checked)}
                                                                        className="rounded"
                                                                    />
                                                                    Aperçu
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeLecture(chapterIndex, lectureIndex)}
                                                                    className="text-red-400 hover:text-red-600"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => addLecture(chapterIndex)}
                                                            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 text-sm"
                                                        >
                                                            + Ajouter une leçon
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Media */}
                        {currentStep === 4 && (
                            <div className="p-6 md:p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Image de couverture <span className="text-red-500">*</span>
                                    </label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-blue-400 ${
                                            imagePreview ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'
                                        }`}
                                    >
                                        <input 
                                            ref={fileInputRef}
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className='hidden' 
                                        />
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-lg" />
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                    🖼️
                                                </div>
                                                <p className="text-gray-700 font-medium">Cliquez pour télécharger</p>
                                                <p className="text-gray-400 text-sm">Format recommandé: 1280x720 pixels</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Vidéo de présentation <span className="text-gray-400 font-normal">(Optionnel)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500">▶</span>
                                        <input 
                                            type="url" 
                                            placeholder='https://www.youtube.com/watch?v=...'
                                            value={previewVideo}
                                            onChange={(e) => setPreviewVideo(e.target.value)}
                                            className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none' 
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Vidéo YouTube pour présenter votre cours aux visiteurs</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Lien Playlist YouTube <span className="text-gray-400 font-normal">(Optionnel)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500">📋</span>
                                        <input 
                                            type="url" 
                                            placeholder='https://www.youtube.com/playlist?list=...'
                                            value={playlistLink}
                                            onChange={(e) => setPlaylistLink(e.target.value)}
                                            className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none' 
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Lien vers une playlist YouTube existante (pour référence)</p>
                                </div>

                                {/* Summary */}
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">📋 Résumé du cours</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-500">Titre:</span> <span className="font-medium">{courseTitle || '-'}</span></div>
                                        <div><span className="text-gray-500">Prix:</span> <span className="font-medium">${finalPrice}</span></div>
                                        <div><span className="text-gray-500">Catégorie:</span> <span className="font-medium">{categories.find(c => c.id === category)?.label}</span></div>
                                        <div><span className="text-gray-500">Niveau:</span> <span className="font-medium">{levels.find(l => l.id === level)?.label}</span></div>
                                        <div><span className="text-gray-500">Chapitres:</span> <span className="font-medium">{chapters.length}</span></div>
                                        <div><span className="text-gray-500">Leçons:</span> <span className="font-medium">{totalLectures}</span></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="px-6 md:px-8 py-4 bg-gray-50 border-t flex justify-between">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="px-6 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Précédent
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
                                >
                                    Suivant →
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="px-8 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? '⏳ Création...' : '✓ Créer le cours'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddCourse
