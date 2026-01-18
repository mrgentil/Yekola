import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from '../../components/student/Footer'

const Profile = () => {
  const { backendUrl, getAccessToken, enrolledCourses, currency } = useContext(AppContext)
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [courseProgress, setCourseProgress] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [enrolledCourses])

  const fetchProgress = async () => {
    try {
      const token = await getAccessToken()
      if (!token || !enrolledCourses.length) {
        setLoading(false)
        return
      }

      const progressData = {}
      for (const course of enrolledCourses) {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/user/course-progress/${course._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (data.success) {
            progressData[course._id] = data.progress
          }
        } catch (err) {
          progressData[course._id] = { completedLectures: [], progressPercentage: 0 }
        }
      }
      setCourseProgress(progressData)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalProgress = () => {
    if (!enrolledCourses.length) return 0
    const total = Object.values(courseProgress).reduce((acc, p) => acc + (p?.progressPercentage || 0), 0)
    return Math.round(total / enrolledCourses.length)
  }

  const getCompletedCourses = () => {
    return enrolledCourses.filter(course => {
      const progress = courseProgress[course._id]
      return progress?.progressPercentage >= 100
    })
  }

  const getInProgressCourses = () => {
    return enrolledCourses.filter(course => {
      const progress = courseProgress[course._id]
      return progress?.progressPercentage > 0 && progress?.progressPercentage < 100
    })
  }

  const stats = [
    { label: 'Cours inscrits', value: enrolledCourses.length, icon: '📚', color: 'bg-blue-500' },
    { label: 'En cours', value: getInProgressCourses().length, icon: '📖', color: 'bg-yellow-500' },
    { label: 'Terminés', value: getCompletedCourses().length, icon: '✅', color: 'bg-green-500' },
    { label: 'Progression', value: `${calculateTotalProgress()}%`, icon: '📊', color: 'bg-purple-500' },
  ]

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'courses', label: 'Mes cours', icon: '📚' },
    { id: 'certificates', label: 'Certificats', icon: '🏆' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 pt-20 pb-32'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row items-center gap-6'>
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='w-28 h-28 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 shadow-xl border-4 border-white'
            >
              {user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </motion.div>
            
            {/* User Info */}
            <div className='text-center md:text-left'>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='text-3xl font-bold text-white'
              >
                {user?.firstName} {user?.lastName}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='text-blue-100 mt-1'
              >
                {user?.email}
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='flex items-center gap-3 mt-3 justify-center md:justify-start'
              >
                <span className='bg-white/20 text-white px-3 py-1 rounded-full text-sm'>
                  🎓 Étudiant
                </span>
                <span className='bg-white/20 text-white px-3 py-1 rounded-full text-sm'>
                  📅 Membre depuis {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16'>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='grid grid-cols-2 md:grid-cols-4 gap-4'
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className='bg-white rounded-2xl p-5 shadow-lg border border-gray-100'
            >
              <div className='flex items-center gap-3'>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                  {stat.icon}
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                  <p className='text-sm text-gray-500'>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Tab Navigation */}
          <div className='flex border-b border-gray-100 overflow-x-auto'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className='p-6'>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='space-y-6'
              >
                <h2 className='text-xl font-bold text-gray-900'>Progression récente</h2>
                
                {enrolledCourses.length > 0 ? (
                  <div className='space-y-4'>
                    {enrolledCourses.slice(0, 5).map((course) => {
                      const progress = courseProgress[course._id]?.progressPercentage || 0
                      return (
                        <div key={course._id} className='bg-gray-50 rounded-xl p-4'>
                          <div className='flex items-center gap-4'>
                            <img 
                              src={course.courseThumbnail} 
                              alt={course.courseTitle}
                              className='w-20 h-14 object-cover rounded-lg'
                            />
                            <div className='flex-1 min-w-0'>
                              <h3 className='font-medium text-gray-900 truncate'>{course.courseTitle}</h3>
                              <div className='flex items-center gap-3 mt-2'>
                                <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className='text-sm font-medium text-gray-600'>{progress}%</span>
                              </div>
                            </div>
                            <Link 
                              to={`/player/${course._id}`}
                              className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
                            >
                              Continuer
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <p className='text-gray-500 mb-4'>Vous n'êtes inscrit à aucun cours</p>
                    <Link to='/course-list' className='text-blue-600 hover:underline'>
                      Découvrir les cours →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='space-y-6'
              >
                <h2 className='text-xl font-bold text-gray-900'>Tous mes cours ({enrolledCourses.length})</h2>
                
                {enrolledCourses.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {enrolledCourses.map((course) => {
                      const progress = courseProgress[course._id]?.progressPercentage || 0
                      const isCompleted = progress >= 100
                      return (
                        <motion.div 
                          key={course._id}
                          whileHover={{ y: -5 }}
                          className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all'
                        >
                          <div className='relative'>
                            <img 
                              src={course.courseThumbnail} 
                              alt={course.courseTitle}
                              className='w-full h-40 object-cover'
                            />
                            {isCompleted && (
                              <div className='absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold'>
                                ✓ Terminé
                              </div>
                            )}
                          </div>
                          <div className='p-4'>
                            <h3 className='font-bold text-gray-900 mb-2 line-clamp-2'>{course.courseTitle}</h3>
                            
                            <div className='mb-4'>
                              <div className='flex justify-between text-sm mb-1'>
                                <span className='text-gray-500'>Progression</span>
                                <span className='font-medium'>{progress}%</span>
                              </div>
                              <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                                <div 
                                  className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>

                            <Link 
                              to={`/player/${course._id}`}
                              className={`block w-full text-center py-2 rounded-lg font-medium transition-colors ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isCompleted ? 'Revoir le cours' : 'Continuer'}
                            </Link>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <p className='text-gray-500 mb-4'>Aucun cours inscrit</p>
                    <Link to='/course-list' className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                      Explorer les cours
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='space-y-6'
              >
                <h2 className='text-xl font-bold text-gray-900'>Mes certificats ({getCompletedCourses().length})</h2>
                
                {getCompletedCourses().length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {getCompletedCourses().map((course) => (
                      <motion.div 
                        key={course._id}
                        whileHover={{ scale: 1.02 }}
                        className='bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 relative overflow-hidden'
                      >
                        {/* Certificate Badge */}
                        <div className='absolute top-4 right-4 text-4xl'>🏆</div>
                        
                        <div className='flex items-start gap-4'>
                          <img 
                            src={course.courseThumbnail} 
                            alt={course.courseTitle}
                            className='w-20 h-20 object-cover rounded-xl'
                          />
                          <div className='flex-1'>
                            <p className='text-sm text-yellow-600 font-semibold mb-1'>CERTIFICAT DE COMPLÉTION</p>
                            <h3 className='font-bold text-gray-900 mb-2'>{course.courseTitle}</h3>
                            <p className='text-sm text-gray-500'>
                              Délivré à {user?.firstName} {user?.lastName}
                            </p>
                            <p className='text-xs text-gray-400 mt-1'>
                              Complété le {new Date().toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>

                        <div className='mt-4 flex gap-3'>
                          <button className='flex-1 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors'>
                            📥 Télécharger
                          </button>
                          <button className='flex-1 py-2 bg-white text-yellow-600 border border-yellow-300 rounded-lg font-medium hover:bg-yellow-50 transition-colors'>
                            🔗 Partager
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <div className='text-6xl mb-4'>🎓</div>
                    <p className='text-gray-500 mb-2'>Aucun certificat pour le moment</p>
                    <p className='text-sm text-gray-400'>Terminez un cours pour obtenir votre certificat</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='space-y-6'
              >
                <h2 className='text-xl font-bold text-gray-900'>Paramètres du profil</h2>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Prénom</label>
                    <input 
                      type='text'
                      defaultValue={user?.firstName}
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Nom</label>
                    <input 
                      type='text'
                      defaultValue={user?.lastName}
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                    <input 
                      type='email'
                      defaultValue={user?.email}
                      disabled
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Téléphone</label>
                    <input 
                      type='tel'
                      defaultValue={user?.phone}
                      placeholder='Votre numéro de téléphone'
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Bio</label>
                  <textarea 
                    rows={4}
                    placeholder='Parlez-nous de vous...'
                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                  ></textarea>
                </div>

                <button className='px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors'>
                  Sauvegarder les modifications
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className='mt-16'>
        <Footer />
      </div>
    </div>
  )
}

export default Profile
