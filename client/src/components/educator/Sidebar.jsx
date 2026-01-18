import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';
import axios from 'axios';

const Sidebar = () => {
  const {isEducator, backendUrl, getAccessToken} = useContext(AppContext);
  const [stats, setStats] = useState({ recentEnrollments: 0, unreadNotifications: 0 })

  const fetchStats = async () => {
    try {
      const token = await getAccessToken()
      if (!token) return

      const { data } = await axios.get(`${backendUrl}/api/notifications/educator-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching educator stats:', error)
    }
  }

  useEffect(() => {
    if (isEducator) {
      fetchStats()
      const interval = setInterval(fetchStats, 30000)
      return () => clearInterval(interval)
    }
  }, [isEducator])

  const menuItems = [
    {name: 'Tableau de bord', path: '/educator', icon: assets.home_icon },
    {name: 'Ajouter un cours', path: '/educator/add-course', icon: assets.add_icon },
    {name: 'Mes cours', path: '/educator/my-courses', icon: assets.my_course_icon },
    {name: 'Étudiants inscrits', path: '/educator/student-enrolled', icon: assets.person_tick_icon, badge: stats.recentEnrollments },
    {name: 'Mes revenus', path: '/educator/earnings', icon: assets.dollar_icon || assets.home_icon },
  ]
  

  return isEducator && (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col '>
      {menuItems.map((item)=>(
        <NavLink
        to={item.path}
        key={item.name}
        end={item.path === '/educator'}
        className={({isActive})=> `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 ${isActive ? 'bg-indigo-50 border-r-[6px] border-indigo-500/90' : 'hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90 '} `}
        >
          <img src={item.icon} alt="" className='w-6 h-6' />
          <p className='md:block hidden text-center flex-1'>{item.name}</p>
          {item.badge > 0 && (
            <span className='bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full md:block hidden'>
              +{item.badge}
            </span>
          )}
        </NavLink>
      ))}
      
    </div>
  )
}

export default Sidebar
