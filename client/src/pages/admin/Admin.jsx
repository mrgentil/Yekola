import React, { useContext, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AppContext } from '../../context/AppContext'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminNavbar from '../../components/admin/AdminNavbar'
import Loading from '../../components/student/Loading'

const Admin = () => {
  const { user, loading } = useAuth()
  const { isAdmin } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Pas connecté, rediriger vers la page de connexion
        navigate('/signin', { replace: true })
      } else if (!isAdmin && user.role !== 'admin') {
        // Connecté mais pas admin, rediriger vers l'accueil
        navigate('/', { replace: true })
      }
    }
  }, [user, loading, isAdmin, navigate])

  // Afficher le chargement pendant la vérification
  if (loading) {
    return <Loading />
  }

  // Si pas connecté ou pas admin, ne rien afficher (la redirection est en cours)
  if (!user || (!isAdmin && user.role !== 'admin')) {
    return <Loading />
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <AdminSidebar />
      <div className='flex-1 flex flex-col'>
        <AdminNavbar />
        <main className='flex-1 overflow-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Admin
