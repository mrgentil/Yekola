import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const TrendingCourses = () => {
  const { allCourses, currency, calculateRating } = useContext(AppContext)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'Tous', icon: '🔥' },
    { id: 'popular', label: 'Les plus populaires', icon: '⭐' },
    { id: 'new', label: 'Nouveautés', icon: '✨' },
    { id: 'trending', label: 'Tendances', icon: '📈' },
  ]

  const getFilteredCourses = () => {
    if (!allCourses || allCourses.length === 0) return []
    
    let filtered = [...allCourses]
    
    switch (activeCategory) {
      case 'popular':
        // Trier par nombre d'inscrits
        filtered = filtered.sort((a, b) => 
          (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0)
        )
        break
      case 'new':
        // Trier par date de création (les plus récents)
        filtered = filtered.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        break
      case 'trending':
        // Combinaison de notes et inscriptions récentes
        filtered = filtered.sort((a, b) => {
          const scoreA = (calculateRating(a) * 2) + (a.enrolledStudents?.length || 0)
          const scoreB = (calculateRating(b) * 2) + (b.enrolledStudents?.length || 0)
          return scoreB - scoreA
        })
        break
      default:
        break
    }
    
    return filtered.slice(0, 8)
  }

  const getBadge = (course, index) => {
    const enrolledCount = course.enrolledStudents?.length || 0
    const rating = calculateRating(course)
    const isNew = new Date(course.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
    
    if (enrolledCount > 50 || (index < 2 && activeCategory === 'popular')) {
      return { text: 'Bestseller', color: 'bg-yellow-400 text-yellow-900' }
    }
    if (isNew) {
      return { text: 'Nouveau', color: 'bg-green-500 text-white' }
    }
    if (rating >= 4.5) {
      return { text: 'Top noté', color: 'bg-purple-500 text-white' }
    }
    if (index < 3 && activeCategory === 'trending') {
      return { text: 'Tendance', color: 'bg-orange-500 text-white' }
    }
    return null
  }

  const filteredCourses = getFilteredCourses()

  return (
    <section className='py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-center mb-10'
        >
          <div className='inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4'>
            <span className='text-lg'>🔥</span>
            <span>Cours en vedette</span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Cours <span className='text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500'>Tendances</span>
          </h2>
          <p className='text-gray-600 max-w-2xl mx-auto'>
            Découvrez les cours les plus populaires choisis par des milliers d'apprenants
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className='flex flex-wrap justify-center gap-3 mb-10'
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Courses Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {filteredCourses.map((course, index) => {
            const badge = getBadge(course, index)
            const rating = calculateRating(course)
            const finalPrice = course.coursePrice - (course.coursePrice * (course.discount || 0) / 100)
            
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className='group'
              >
                <Link to={`/course/${course._id}`}>
                  <div className='bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300'>
                    {/* Thumbnail */}
                    <div className='relative overflow-hidden'>
                      <img 
                        src={course.courseThumbnail} 
                        alt={course.courseTitle}
                        className='w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500'
                      />
                      
                      {/* Badge */}
                      {badge && (
                        <span className={`absolute top-3 left-3 ${badge.color} px-2.5 py-1 rounded text-xs font-bold`}>
                          {badge.text}
                        </span>
                      )}
                      
                      {/* Discount Badge */}
                      {course.discount > 0 && (
                        <span className='absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold'>
                          -{course.discount}%
                        </span>
                      )}

                      {/* Hover Overlay */}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <div className='absolute bottom-3 left-3 right-3'>
                          <span className='inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-sm font-medium'>
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' />
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            Aperçu
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className='p-4'>
                      <h3 className='font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors'>
                        {course.courseTitle}
                      </h3>
                      
                      {/* Educator */}
                      <p className='text-sm text-gray-500 mb-2'>
                        {course.educator?.firstName || 'Instructeur'} {course.educator?.lastName || ''}
                      </p>

                      {/* Rating */}
                      <div className='flex items-center gap-2 mb-3'>
                        <span className='font-bold text-amber-500'>{rating || '4.5'}</span>
                        <div className='flex'>
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(rating || 4.5) ? 'text-amber-400' : 'text-gray-300'}`}
                              fill='currentColor' 
                              viewBox='0 0 20 20'
                            >
                              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                            </svg>
                          ))}
                        </div>
                        <span className='text-xs text-gray-400'>({course.enrolledStudents?.length || 0})</span>
                      </div>

                      {/* Price */}
                      <div className='flex items-center gap-2'>
                        <span className='text-xl font-bold text-gray-900'>
                          {currency}{finalPrice.toFixed(0)}
                        </span>
                        {course.discount > 0 && (
                          <span className='text-sm text-gray-400 line-through'>
                            {currency}{course.coursePrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className='text-center mt-10'
        >
          <Link 
            to='/course-list'
            className='inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1'
          >
            Voir tous les cours
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default TrendingCourses
