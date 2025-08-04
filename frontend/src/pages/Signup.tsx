import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../lib/api'
import { Eye, EyeOff, Mail, Lock, User, Gift } from 'lucide-react'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validatingReferral, setValidatingReferral] = useState(false)
  const [referralValid, setReferralValid] = useState<boolean | null>(null)
  const [referrerName, setReferrerName] = useState('')
  
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlReferralCode = searchParams.get('ref')

  // Set referral code from URL if present
  useState(() => {
    if (urlReferralCode && !formData.referralCode) {
      setFormData(prev => ({ ...prev, referralCode: urlReferralCode }))
      validateReferralCode(urlReferralCode)
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validate referral code when typing
    if (name === 'referralCode' && value.length > 0) {
      validateReferralCode(value)
    }
  }

  const validateReferralCode = async (code: string) => {
    if (code.length < 3) {
      setReferralValid(null)
      return
    }

    setValidatingReferral(true)
    try {
      const response = await authAPI.validateReferral(code)
      setReferralValid(true)
      setReferrerName(response.data.referrerName)
    } catch (error) {
      setReferralValid(false)
      setReferrerName('')
    } finally {
      setValidatingReferral(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (formData.referralCode && !referralValid) {
      toast.error('Please enter a valid referral code')
      return
    }

    setLoading(true)
    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.referralCode || undefined
      )
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">IP</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Join the Intern Portal community
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input pl-10 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={cn(
                    "input pl-10 pr-10",
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "border-danger-300 focus:border-danger-500"
                      : ""
                  )}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-danger-600">Passwords do not match</p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-secondary-700">
                Referral Code (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Gift className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                  className={cn(
                    "input pl-10",
                    formData.referralCode && referralValid === false
                      ? "border-danger-300 focus:border-danger-500"
                      : formData.referralCode && referralValid === true
                      ? "border-success-300 focus:border-success-500"
                      : ""
                  )}
                  placeholder="Enter referral code"
                />
                {validatingReferral && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
              {formData.referralCode && (
                <div className="mt-1">
                  {referralValid === true && (
                    <p className="text-xs text-success-600 flex items-center">
                      ✓ Valid referral code from {referrerName}
                    </p>
                  )}
                  {referralValid === false && (
                    <p className="text-xs text-danger-600">Invalid referral code</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-secondary-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        {/* Benefits */}
        <div className="mt-8 p-4 bg-secondary-50 rounded-lg">
          <h3 className="text-sm font-medium text-secondary-700 mb-3">Why join Intern Portal?</h3>
          <div className="space-y-2 text-xs text-secondary-600">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
              Track your donations and impact
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
              Earn rewards and badges
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
              Refer friends and grow together
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
              Compete on leaderboards
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 