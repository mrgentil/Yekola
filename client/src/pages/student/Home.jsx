import React, { useContext } from 'react'
import Hero from '../../components/student/Hero'
import Companies from '../../components/student/Companies'
import CoursesSection from '../../components/student/CoursesSection'
import TrendingCourses from '../../components/student/TrendingCourses'
import TestimonialsSection from '../../components/student/TestimonialsSection'
import CallToAction from '../../components/student/CallToAction'
import Footer from '../../components/student/Footer'
import Logger from '../../components/Logger'
import { SiteContext } from '../../context/SiteContext'

const Home = () => {
  const { siteSettings } = useContext(SiteContext)

  return (
    <div className='flex flex-col w-full'>
      <Hero/>
      <div className='w-full space-y-7'>
        <div className="block sm:hidden ">
          <Logger/>
        </div>
        {siteSettings.showCompanies !== false && <Companies/>}
        {siteSettings.showTrending !== false && <TrendingCourses/>}
        <CoursesSection/>
        {siteSettings.showTestimonials !== false && <TestimonialsSection/>}
        <CallToAction/>
        <Footer/>
      </div>
    </div>
  )
}

export default Home
