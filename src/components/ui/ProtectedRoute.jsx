import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthService } from '../../services/Login/authService'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = AuthService.getToken()

        if (!token) {
          setIsLoading(false)
          return
        }
        const forcePasswordChange = AuthService.getForcePasswordChange()
        const isChangePasswordPage = location.pathname === '/change-password'

        if (forcePasswordChange && isChangePasswordPage) {
          setIsAuthenticated(true)
          setUserRole(AuthService.getUserRole())
          setIsLoading(false)
          return
        }
        const response = await AuthService.verifyToken()

        if (response.status === 'success') {
          setIsAuthenticated(true)
          setUserRole(response.data.role)
        } else {
          localStorage.removeItem('authToken')
          localStorage.removeItem('tempToken')
          localStorage.removeItem('userRole')
          localStorage.removeItem('userId')
          localStorage.removeItem('userName')
          localStorage.removeItem('userUsername')
          localStorage.removeItem('forcePasswordChange')
        }
      } catch (error) {
        console.error('❌ ProtectedRoute - Auth verification failed:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('tempToken')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('userUsername')
        localStorage.removeItem('forcePasswordChange')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [location.pathname])
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <span className="ml-3 text-lg">Memverifikasi akses...</span>
      </div>
    )
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  const forcePasswordChange = AuthService.getForcePasswordChange()
  const isChangePasswordPage = location.pathname === '/change-password'

  if (forcePasswordChange && !isChangePasswordPage) {
    return <Navigate to="/change-password" replace />
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const redirectUrl = AuthService.getRedirectUrl(userRole)
    return <Navigate to={redirectUrl} replace />
  }
  return children
}
