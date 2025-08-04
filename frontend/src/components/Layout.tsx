import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Home, 
  Trophy, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Copy,
  Share2
} from 'lucide-react'
import { cn } from '../lib/utils'
import { getInitials, generateAvatarColor, copyToClipboard } from '../lib/utils'
import toast from 'react-hot-toast'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      try {
        await copyToClipboard(user.referralCode)
        toast.success('Referral code copied!')
      } catch (error) {
        toast.error('Failed to copy referral code')
      }
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">IP</span>
              </div>
              <span className="text-xl font-bold gradient-text">Intern Portal</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-secondary-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-secondary-200 p-4">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm',
                  generateAvatarColor(user?.name || '')
                )}
              >
                {getInitials(user?.name || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Referral code */}
            <div className="mt-3 p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-secondary-700">Referral Code</p>
                  <p className="text-sm font-mono text-secondary-900">{user?.referralCode}</p>
                </div>
                <button
                  onClick={copyReferralCode}
                  className="p-1 rounded hover:bg-secondary-200 transition-colors"
                  title="Copy referral code"
                >
                  <Copy className="h-4 w-4 text-secondary-500" />
                </button>
              </div>
            </div>

            {/* Theme toggle */}
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 text-secondary-500" />
                ) : (
                  <Sun className="h-4 w-4 text-secondary-500" />
                )}
                <span className="text-sm text-secondary-700">
                  {theme === 'light' ? 'Dark' : 'Light'}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-danger-50 text-danger-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-secondary-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm',
                generateAvatarColor(user?.name || '')
              )}
            >
              {getInitials(user?.name || '')}
            </div>
            <span className="text-sm font-medium text-secondary-900">
              {user?.name}
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 