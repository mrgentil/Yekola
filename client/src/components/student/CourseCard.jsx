import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'

const CourseCard = ({course}) => {
  const {currency, calculateRating, addToWishlist, removeFromWishlist, isInWishlist} = useContext(AppContext)
  const inWishlist = isInWishlist(course._id)
  const rating = calculateRating(course)
  const originalPrice = course.coursePrice
  const finalPrice = (originalPrice - course.discount * originalPrice / 100).toFixed(2)
  const hasDiscount = course.discount > 0
  const isFree = parseFloat(finalPrice) === 0

  return (
    <Link 
      to={'/course/' + course._id} 
      onClick={()=>scrollTo(0,0)} 
      className='group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col'
    >
      {/* Thumbnail with overlay */}
      <div className='relative overflow-hidden'>
        <img 
          className='w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300' 
          src={course.courseThumbnail} 
          alt={course.courseTitle} 
        />
        {/* Badges */}
        <div className='absolute top-2 left-2 flex gap-2'>
          {isFree && (
            <span className='bg-green-500 text-white text-xs font-bold px-2 py-1 rounded'>
              GRATUIT
            </span>
          )}
          {hasDiscount && !isFree && (
            <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>
              -{course.discount}%
            </span>
          )}
        </div>
        {/* Wishlist button */}
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            inWishlist ? removeFromWishlist(course._id) : addToWishlist(course._id)
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
            inWishlist 
              ? 'bg-red-500 text-white opacity-100' 
              : 'bg-white text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-gray-100'
          }`}
        >
          <svg className='w-4 h-4' fill={inWishlist ? 'currentColor' : 'none'} stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className='p-4 flex flex-col flex-grow'>
        {/* Title */}
        <h3 className='font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors'>
          {course.courseTitle}
        </h3>
        
        {/* Instructor */}
        <p className='text-xs text-gray-500 mb-2'>
          {course.educator?.firstName || 'Unknown'} {course.educator?.lastName || 'Educator'}
        </p>
        
        {/* Rating */}
        <div className='flex items-center gap-1 mb-2'>
          <span className='font-bold text-sm text-amber-700'>{rating}</span>
          <div className='flex'>
            {[...Array(5)].map((_,i)=>(
              <svg 
                key={i} 
                className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'}`}
                fill='currentColor' 
                viewBox='0 0 20 20'
              >
                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
              </svg>
            ))}
          </div>
          <span className='text-xs text-gray-500'>({course.courseRatings.length})</span>
        </div>

        {/* Course info */}
        <div className='flex items-center gap-3 text-xs text-gray-500 mb-3'>
          <span className='flex items-center gap-1'>
            <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
            </svg>
            {course.courseContent?.length || 0} chapitres
          </span>
          <span className='flex items-center gap-1'>
            <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
            {course.enrolledStudents?.length || 0} étudiants
          </span>
        </div>

        {/* Price - pushed to bottom */}
        <div className='mt-auto pt-3 border-t border-gray-100'>
          {isFree ? (
            <span className='text-lg font-bold text-green-600'>Gratuit</span>
          ) : (
            <div className='flex items-center gap-2'>
              <span className='text-lg font-bold text-gray-900'>{currency} {finalPrice}</span>
              {hasDiscount && (
                <span className='text-sm text-gray-400 line-through'>{currency} {originalPrice}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default CourseCard
