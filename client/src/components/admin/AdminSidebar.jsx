import React, { useState, useEffect, useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'

const AdminSidebar = () => {
  const { backendUrl, getAccessToken } = useContext(AppContext)
  const [pendingPayments, setPendingPayments] = useState(0)

  const fetchStats = async () => {
    try {
      const token = await getAccessToken()
      if (!token) return

      const { data } = await axios.get(`${backendUrl}/api/notifications/admin-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setPendingPayments(data.stats.pendingPayments || 0)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    { name: 'Tableau de bord', path: '/admin', icon: '📊' },
    { name: 'Utilisateurs', path: '/admin/users', icon: '👥' },
    { name: 'Cours', path: '/admin/courses', icon: '📚' },
    { name: 'Paiements', path: '/admin/payments', icon: '💳', badge: pendingPayments },
    { name: 'Coupons', path: '/admin/coupons', icon: '🎟️' },
    { name: 'Personnalisation', path: '/admin/site', icon: '🎨' },
    { name: 'Paramètres', path: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <div className='w-64 bg-gray-900 text-white min-h-screen flex flex-col'>
      {/* Logo */}
      <div className='p-6 border-b border-gray-700'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
            <span className='text-xl'>🛡️</span>
          </div>
          <div>
            <h1 className='text-lg font-bold'>LearnHub</h1>
            <p className='text-xs text-gray-400'>Administration</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className='flex-1 p-4'>
        <ul className='space-y-2'>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <span className='text-xl'>{item.icon}</span>
                <span className='font-medium flex-1'>{item.name}</span>
                {item.badge > 0 && (
                  <span className='bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse'>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className='p-4 border-t border-gray-700'>
        <NavLink
          to="/"
          className='flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200'
        >
          <span className='text-xl'>🏠</span>
          <span className='font-medium'>Retour au site</span>
        </NavLink>
      </div>
    </div>
  )
}

export default AdminSidebar
