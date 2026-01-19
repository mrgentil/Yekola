import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/student/Home'
import CoursesList from './pages/student/CoursesList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollMents from './pages/student/MyEnrollMents'
import Player from './pages/student/Player'
import Payment from './pages/student/Payment'
import Profile from './pages/student/Profile'
import Wishlist from './pages/student/Wishlist'
import Certificate from './pages/student/Certificate'
import Loading from './components/student/Loading'
import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import PaymentManagement from './pages/educator/PaymentManagement'
import Earnings from './pages/educator/Earnings'
import QuizManager from './pages/educator/QuizManager'
import Navbar from './components/student/Navbar'
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import "quill/dist/quill.snow.css";
import { ToastContainer } from 'react-toastify';
import About from './components/About'
import ContactForm from './components/ContactForm'

// Admin imports
import Admin from './pages/admin/Admin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCourses from './pages/admin/AdminCourses'
import AdminPayments from './pages/admin/AdminPayments'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminSettings from './pages/admin/AdminSettings'
import AdminSiteSettings from './pages/admin/AdminSiteSettings'
import AdminPayouts from './pages/admin/AdminPayouts'


const App = () => {
  const location = useLocation()
  const isEducatorRoute = location.pathname.startsWith('/educator')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAuthRoute = location.pathname === '/signin' || location.pathname === '/signup'

  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer />
      {!isEducatorRoute && !isAdminRoute && !isAuthRoute && <Navbar/> }
      
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/course-list' element={<CoursesList/>} />
        <Route path='/course-list/:input' element={<CoursesList/>} />
        <Route path='/course/:id' element={<CourseDetails/>} />
        <Route path='/my-enrollments' element={<MyEnrollMents/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/wishlist' element={<Wishlist/>} />
        <Route path='/player/:courseId' element={<Player/>} />
        <Route path='/certificate/:certificateId' element={<Certificate/>} />
        <Route path='/loading/:path' element={<Loading/>} />

        {/* Authentication Routes */}
        <Route path='/signin' element={<SignIn/>} />
        <Route path='/signup' element={<SignUp/>} />

        <Route path='/about' element={<About/>} />
        <Route path='/contact' element={<ContactForm/>} />

        <Route path='/payment/:courseId' element={<Payment/>} />

        <Route path='/educator' element={ <Educator />} >
            <Route path='/educator' element={<Dashboard />} />
            <Route path='add-course' element={<AddCourse />} />
            <Route path='my-courses' element={<MyCourses />} />
            <Route path='student-enrolled' element={<StudentsEnrolled />} />
            <Route path='payments' element={<PaymentManagement />} />
            <Route path='earnings' element={<Earnings />} />
            <Route path='quizzes' element={<QuizManager />} />
        </Route>

        {/* Admin Routes */}
        <Route path='/admin' element={<Admin />}>
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='users' element={<AdminUsers />} />
            <Route path='courses' element={<AdminCourses />} />
            <Route path='payments' element={<AdminPayments />} />
            <Route path='coupons' element={<AdminCoupons />} />
            <Route path='settings' element={<AdminSettings />} />
            <Route path='site' element={<AdminSiteSettings />} />
            <Route path='payouts' element={<AdminPayouts />} />
        </Route>

      </Routes>
    </div>
  )
}

export default App
