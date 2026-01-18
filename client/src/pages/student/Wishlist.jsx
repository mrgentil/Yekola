import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../../components/student/Footer'

const Wishlist = () => {
  const { wishlist, removeFromWishlist, currency, calculateRating } = useContext(AppContext)

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-gradient-to-r from-pink-500 to-red-500 pt-24 pb-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-center text-white'
          >
            <h1 className='text-3xl md:text-4xl font-bold mb-2'>❤️ Ma liste de souhaits</h1>
            <p className='text-pink-100'>{wishlist.length} cours sauvegardés</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {wishlist.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            <AnimatePresence>
              {wishlist.map((course, index) => {
                const rating = calculateRating(course)
                const finalPrice = course.coursePrice - (course.coursePrice * (course.discount || 0) / 100)
                
                return (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className='bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group'
                  >
                    {/* Thumbnail */}
                    <div className='relative'>
                      <Link to={`/course/${course._id}`}>
                        <img 
                          src={course.courseThumbnail} 
                          alt={course.courseTitle}
                          className='w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300'
                        />
                      </Link>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromWishlist(course._id)}
                        className='absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-lg'
                        title='Retirer des favoris'
                      >
                        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z' clipRule='evenodd' />
                        </svg>
                      </button>

                      {/* Discount Badge */}
                      {course.discount > 0 && (
                        <span className='absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold'>
                          -{course.discount}%
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className='p-4'>
                      <Link to={`/course/${course._id}`}>
                        <h3 className='font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors'>
                          {course.courseTitle}
                        </h3>
                      </Link>

                      {/* Educator */}
                      <p className='text-sm text-gray-500 mb-2'>
                        {course.educator?.firstName} {course.educator?.lastName}
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
                      </div>

                      {/* Price */}
                      <div className='flex items-center justify-between'>
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

                      {/* Action Button */}
                      <Link 
                        to={`/course/${course._id}`}
                        className='mt-4 block w-full text-center py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all'
                      >
                        Voir le cours
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-center py-20'
          >
            <div className='text-6xl mb-4'>💔</div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Votre liste de souhaits est vide</h2>
            <p className='text-gray-500 mb-6'>Explorez nos cours et ajoutez vos favoris ici</p>
            <Link 
              to='/course-list'
              className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg transition-all'
            >
              Découvrir les cours
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Wishlist
