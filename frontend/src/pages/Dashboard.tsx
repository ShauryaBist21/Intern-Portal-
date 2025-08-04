import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dashboardAPI } from '../lib/api'
import { 
  DollarSign, 
  Users, 
  Trophy, 
  TrendingUp,
  Plus,
  Gift,
  Share2,
  Copy,
  CheckCircle,
  Lock
} from 'lucide-react'
import { cn, formatCurrency, getInitials, generateAvatarColor } from '../lib/utils'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    referralCode: string
    totalDonations: number
    rewards: Array<{
      name: string
      description: string
      unlocked: boolean
      unlockedAt?: string
    }>
    referredBy?: {
      name: string
      email: string
    }
    referralCount: number
    totalReferralDonations: number
  }
}

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState('')
  const [updatingDonations, setUpdatingDonations] = useState(false)
  const [shareLink, setShareLink] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await dashboardAPI.getProfile()
      setDashboardData(response.data)
      updateUser(response.data.user)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDonationUpdate = async () => {
    const amount = parseFloat(donationAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setUpdatingDonations(true)
    try {
      const response = await dashboardAPI.updateDonations(amount)
      setDashboardData(prev => prev ? {
        ...prev,
        user: {
          ...prev.user,
          totalDonations: response.data.totalDonations,
          rewards: response.data.rewards
        }
      } : null)
      updateUser({
        totalDonations: response.data.totalDonations,
        rewards: response.data.rewards
      })
      setDonationAmount('')
      toast.success('Donation updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update donation')
    } finally {
      setUpdatingDonations(false)
    }
  }

  const generateShareLink = async () => {
    try {
      const response = await dashboardAPI.shareReferral()
      setShareLink(response.data.shareableLink)
      toast.success('Share link generated!')
    } catch (error) {
      toast.error('Failed to generate share link')
    }
  }

  const copyShareLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink)
        toast.success('Link copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy link')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">Failed to load dashboard data</p>
      </div>
    )
  }

  const { user: dashboardUser } = dashboardData

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {dashboardUser.name}! 👋
        </h1>
        <p className="text-primary-100">
          Track your impact and earn rewards as you make a difference
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-primary-100">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Donations</p>
              <p className="text-2xl font-bold text-secondary-900">
                {formatCurrency(dashboardUser.totalDonations)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-success-100">
              <Users className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Referrals</p>
              <p className="text-2xl font-bold text-secondary-900">
                {dashboardUser.referralCount}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-warning-100">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Referral Donations</p>
              <p className="text-2xl font-bold text-secondary-900">
                {formatCurrency(dashboardUser.totalReferralDonations)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-secondary-100">
              <Trophy className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Rewards Earned</p>
              <p className="text-2xl font-bold text-secondary-900">
                {dashboardUser.rewards.filter(r => r.unlocked).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Donation */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Add Donation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Donation Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-secondary-500">$</span>
                </div>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="input pl-8"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <button
              onClick={handleDonationUpdate}
              disabled={updatingDonations || !donationAmount}
              className="btn-primary w-full flex items-center justify-center"
            >
              {updatingDonations ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Donation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Referral Management */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Referral Management</h3>
          <div className="space-y-4">
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm font-medium text-secondary-700">Your Referral Code</p>
              <div className="flex items-center mt-1">
                <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                  {dashboardUser.referralCode}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(dashboardUser.referralCode)}
                  className="ml-2 p-1 hover:bg-secondary-200 rounded transition-colors"
                  title="Copy referral code"
                >
                  <Copy className="h-4 w-4 text-secondary-500" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={generateShareLink}
                className="btn-outline w-full flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Generate Share Link
              </button>

              {shareLink && (
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs font-medium text-primary-700 mb-1">Share Link</p>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="input text-xs flex-1 mr-2"
                    />
                    <button
                      onClick={copyShareLink}
                      className="p-1 hover:bg-primary-200 rounded transition-colors"
                      title="Copy link"
                    >
                      <Copy className="h-4 w-4 text-primary-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Your Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Bronze Badge', description: 'First donation milestone', threshold: 100, icon: '🥉' },
            { name: 'Silver Badge', description: 'Consistent donor', threshold: 500, icon: '🥈' },
            { name: 'Gold Badge', description: 'Top contributor', threshold: 1000, icon: '🥇' },
            { name: 'Platinum Badge', description: 'Elite donor', threshold: 2500, icon: '💎' },
            { name: 'Diamond Badge', description: 'Legendary contributor', threshold: 5000, icon: '💎' }
          ].map((reward) => {
            const userReward = dashboardUser.rewards.find(r => r.name === reward.name)
            const isUnlocked = userReward?.unlocked || false
            const progress = Math.min((dashboardUser.totalDonations / reward.threshold) * 100, 100)

            return (
              <div
                key={reward.name}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  isUnlocked
                    ? 'border-success-200 bg-success-50'
                    : 'border-secondary-200 bg-white'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{reward.icon}</span>
                    <div>
                      <h4 className={cn(
                        'font-medium',
                        isUnlocked ? 'text-success-700' : 'text-secondary-700'
                      )}>
                        {reward.name}
                      </h4>
                      <p className="text-xs text-secondary-500">{reward.description}</p>
                    </div>
                  </div>
                  {isUnlocked ? (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-secondary-400" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary-600">Progress</span>
                    <span className="text-secondary-600">
                      {formatCurrency(dashboardUser.totalDonations)} / {formatCurrency(reward.threshold)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        isUnlocked ? 'bg-success-500' : 'bg-primary-500'
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {isUnlocked && userReward?.unlockedAt && (
                    <p className="text-xs text-success-600">
                      Unlocked {new Date(userReward.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Referred By Section */}
      {dashboardUser.referredBy && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Referred By</h3>
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm',
                generateAvatarColor(dashboardUser.referredBy.name)
              )}
            >
              {getInitials(dashboardUser.referredBy.name)}
            </div>
            <div>
              <p className="font-medium text-secondary-900">{dashboardUser.referredBy.name}</p>
              <p className="text-sm text-secondary-500">{dashboardUser.referredBy.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 