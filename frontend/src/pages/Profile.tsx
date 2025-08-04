import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dashboardAPI } from '../lib/api'
import { 
  User, 
  Mail, 
  Gift, 
  Calendar, 
  DollarSign,
  Users,
  TrendingUp,
  Copy,
  Share2,
  Edit,
  Save,
  X,
  Trophy
} from 'lucide-react'
import { cn, formatCurrency, getInitials, generateAvatarColor, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

interface Referral {
  name: string
  email: string
  totalDonations: number
  createdAt: string
}

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  useEffect(() => {
    loadReferrals()
  }, [])

  const loadReferrals = async () => {
    try {
      const response = await dashboardAPI.getReferrals()
      setReferrals(response.data.referrals)
    } catch (error) {
      console.error('Failed to load referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || ''
    })
    setEditing(true)
  }

  const handleSave = async () => {
    // In a real app, you would update the user profile here
    toast.success('Profile updated successfully!')
    setEditing(false)
  }

  const handleCancel = () => {
    setEditing(false)
  }

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      try {
        await navigator.clipboard.writeText(user.referralCode)
        toast.success('Referral code copied!')
      } catch (error) {
        toast.error('Failed to copy referral code')
      }
    }
  }

  const generateShareLink = async () => {
    try {
      const response = await dashboardAPI.shareReferral()
      const shareLink = response.data.shareableLink
      await navigator.clipboard.writeText(shareLink)
      toast.success('Share link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to generate share link')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Profile</h1>
          <p className="text-secondary-600">Manage your account and view your activity</p>
        </div>
        <button
          onClick={editing ? handleSave : handleEdit}
          className="btn-primary flex items-center"
        >
          {editing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    'h-16 w-16 rounded-full flex items-center justify-center text-white font-medium text-lg',
                    generateAvatarColor(user.name)
                  )}
                >
                  {getInitials(user.name)}
                </div>
                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="input"
                        placeholder="Full name"
                      />
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        className="input"
                        placeholder="Email address"
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-medium text-secondary-900">{user.name}</h4>
                      <p className="text-secondary-600">{user.email}</p>
                    </div>
                  )}
                </div>
                {editing && (
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-secondary-500" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-primary-100">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-600">Total Donations</p>
                  <p className="text-xl font-bold text-secondary-900">
                    {formatCurrency(user.totalDonations)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-success-100">
                  <Users className="h-5 w-5 text-success-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-600">Referrals</p>
                  <p className="text-xl font-bold text-secondary-900">
                    {referrals.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-warning-100">
                  <TrendingUp className="h-5 w-5 text-warning-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-600">Rewards Earned</p>
                  <p className="text-xl font-bold text-secondary-900">
                    {user.rewards.filter(r => r.unlocked).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral History */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Referral History</h3>
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-600">No referrals yet</p>
                <p className="text-sm text-secondary-500 mt-1">
                  Share your referral code to start earning rewards
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm',
                          generateAvatarColor(referral.name)
                        )}
                      >
                        {getInitials(referral.name)}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{referral.name}</p>
                        <p className="text-sm text-secondary-500">{referral.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-secondary-900">
                        {formatCurrency(referral.totalDonations)}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {formatDate(referral.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Referral Code */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Your Referral Code</h3>
            <div className="space-y-4">
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-sm font-medium text-secondary-700 mb-2">Referral Code</p>
                <div className="flex items-center">
                  <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1">
                    {user.referralCode}
                  </code>
                  <button
                    onClick={copyReferralCode}
                    className="ml-2 p-2 hover:bg-secondary-200 rounded transition-colors"
                    title="Copy referral code"
                  >
                    <Copy className="h-4 w-4 text-secondary-500" />
                  </button>
                </div>
              </div>

              <button
                onClick={generateShareLink}
                className="btn-outline w-full flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Generate Share Link
              </button>
            </div>
          </div>

          {/* Rewards */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Your Rewards</h3>
            <div className="space-y-3">
              {user.rewards.filter(r => r.unlocked).length === 0 ? (
                <div className="text-center py-4">
                  <Trophy className="h-8 w-8 text-secondary-300 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600">No rewards earned yet</p>
                  <p className="text-xs text-secondary-500">
                    Start donating to unlock rewards
                  </p>
                </div>
              ) : (
                user.rewards
                  .filter(r => r.unlocked)
                  .map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg border border-success-200"
                    >
                      <div className="p-2 bg-success-100 rounded-lg">
                        <Trophy className="h-4 w-4 text-success-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-success-700">{reward.name}</p>
                        <p className="text-xs text-success-600">{reward.description}</p>
                        {reward.unlockedAt && (
                          <p className="text-xs text-success-500">
                            Unlocked {formatDate(reward.unlockedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-700">Member Since</p>
                  <p className="text-sm text-secondary-600">
                    {formatDate(new Date())}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-700">Email Verified</p>
                  <p className="text-sm text-success-600">✓ Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 