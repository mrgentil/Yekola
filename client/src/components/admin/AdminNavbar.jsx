import React, { useContext } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationBell from '../NotificationBell'

const AdminNavbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className='bg-white border-b border-gray-200 px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold text-gray-900'>Panneau d'administration</h2>
          <p className='text-sm text-gray-500'>Gérez votre plateforme LearnHub</p>
        </div>

        <div className='flex items-center gap-4'>
          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold'>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className='hidden md:block'>
              <p className='text-sm font-medium text-gray-900'>{user?.email}</p>
              <p className='text-xs text-gray-500'>Administrateur</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className='px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors'
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar
