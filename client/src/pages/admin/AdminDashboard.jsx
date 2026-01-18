import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Loading from '../../components/student/Loading'

const AdminDashboard = () => {
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const token = await getAccessToken()
      if (!token) {
        toast.error('Authentification requise')
        return
      }

      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setDashboardData(data)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) return <Loading />

  const stats = [
    { title: 'Total Utilisateurs', value: dashboardData?.stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Étudiants', value: dashboardData?.stats?.totalStudents || 0, icon: '🎓', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
    { title: 'Éducateurs', value: dashboardData?.stats?.totalEducators || 0, icon: '👨‍🏫', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Total Cours', value: dashboardData?.stats?.totalCourses || 0, icon: '📚', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Inscriptions', value: dashboardData?.stats?.totalEnrollments || 0, icon: '📝', color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50' },
    { title: 'Ventes Totales', value: `$${dashboardData?.stats?.totalRevenue || 0}`, icon: '💳', color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50' },
  ]

  const financeStats = [
    { title: 'Commission Plateforme', value: `$${dashboardData?.stats?.platformCommission || 0}`, subtitle: 'Vos gains', icon: '🏦', color: 'from-green-600 to-emerald-600' },
    { title: 'Revenus Éducateurs', value: `$${dashboardData?.stats?.educatorEarnings || 0}`, subtitle: 'Payé aux formateurs', icon: '👨‍🏫', color: 'from-blue-600 to-indigo-600' },
    { title: 'Ventes ce mois', value: `$${dashboardData?.stats?.monthlyRevenue || 0}`, subtitle: 'Mois en cours', icon: '📅', color: 'from-purple-600 to-pink-600' },
    { title: 'Commission ce mois', value: `$${dashboardData?.stats?.monthlyCommission || 0}`, subtitle: 'Vos gains du mois', icon: '💵', color: 'from-yellow-500 to-orange-500' },
  ]

  return (
    <div className='p-6 md:p-8'>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-8'
      >
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Tableau de bord</h1>
        <p className='text-gray-500 mt-1'>Vue d'ensemble de votre plateforme</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, translateY: -5 }}
            className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-500 text-sm font-medium'>{stat.title}</p>
                <p className='text-2xl font-bold text-gray-900 mt-1'>{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Finance Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='mb-8'
      >
        <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
          💰 Revenus de la plateforme
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {financeStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}
            >
              <div className='flex items-center justify-between mb-3'>
                <span className='text-white/80 text-sm'>{stat.title}</span>
                <span className='text-2xl'>{stat.icon}</span>
              </div>
              <p className='text-2xl font-bold'>{stat.value}</p>
              <p className='text-white/70 text-xs mt-1'>{stat.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Data */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          <div className='p-6 border-b border-gray-100 flex items-center justify-between'>
            <h2 className='text-lg font-bold text-gray-900'>Derniers utilisateurs</h2>
            <Link to='/admin/users' className='text-blue-600 text-sm font-medium hover:underline'>
              Voir tout
            </Link>
          </div>
          <div className='divide-y divide-gray-100'>
            {dashboardData?.recentUsers?.map((user, index) => (
              <div key={index} className='p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold'>
                  {user.firstName?.charAt(0) || 'U'}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-red-100 text-red-700' :
                  user.role === 'educator' ? 'bg-purple-100 text-purple-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {user.role === 'admin' ? 'Admin' : user.role === 'educator' ? 'Éducateur' : 'Étudiant'}
                </span>
              </div>
            ))}
            {(!dashboardData?.recentUsers || dashboardData.recentUsers.length === 0) && (
              <div className='p-8 text-center text-gray-500'>
                Aucun utilisateur récent
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Courses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          <div className='p-6 border-b border-gray-100 flex items-center justify-between'>
            <h2 className='text-lg font-bold text-gray-900'>Derniers cours</h2>
            <Link to='/admin/courses' className='text-blue-600 text-sm font-medium hover:underline'>
              Voir tout
            </Link>
          </div>
          <div className='divide-y divide-gray-100'>
            {dashboardData?.recentCourses?.map((course, index) => (
              <div key={index} className='p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors'>
                <img 
                  src={course.courseThumbnail} 
                  alt={course.courseTitle}
                  className='w-16 h-10 object-cover rounded-lg'
                />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {course.courseTitle}
                  </p>
                  <p className='text-xs text-gray-500'>
                    Par {course.educator?.firstName} {course.educator?.lastName}
                  </p>
                </div>
                <span className='text-sm font-semibold text-gray-900'>
                  ${course.coursePrice}
                </span>
              </div>
            ))}
            {(!dashboardData?.recentCourses || dashboardData.recentCourses.length === 0) && (
              <div className='p-8 text-center text-gray-500'>
                Aucun cours récent
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white'
      >
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h3 className='text-xl font-bold'>Nouveaux utilisateurs ce mois</h3>
            <p className='text-blue-100 mt-1'>+{dashboardData?.stats?.newUsersThisMonth || 0} nouveaux inscrits</p>
          </div>
          <div className='flex gap-4'>
            <Link 
              to='/admin/users'
              className='px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors'
            >
              Gérer les utilisateurs
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
