import { useState, useEffect } from 'react'
import { leaderboardAPI } from '../lib/api'
import { Trophy, Users, TrendingUp, Medal, Crown, Star } from 'lucide-react'
import { cn, formatCurrency, getInitials, generateAvatarColor } from '../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'

interface LeaderboardEntry {
  name: string
  referralCode: string
  totalDonations: number
  referralCount?: number
  totalReferralDonations?: number
  overallScore?: number
  rewards?: Array<{
    name: string
    description: string
    unlocked: boolean
  }>
}

interface LeaderboardData {
  topDonors: LeaderboardEntry[]
  topReferrers: LeaderboardEntry[]
  overallLeaders: LeaderboardEntry[]
  stats: {
    totalUsers: number
    totalDonations: number
    avgDonations: number
    maxDonations: number
    totalReferrals: number
    usersWithReferrals: number
  }
}

type LeaderboardType = 'donors' | 'referrers' | 'overall'

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('donors')
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  })

  useEffect(() => {
    loadData()
  }, [activeTab, currentPage])

  const loadData = async () => {
    setLoading(true)
    try {
      const [donorsRes, referrersRes, overallRes, statsRes] = await Promise.all([
        leaderboardAPI.getTopDonors(10, currentPage),
        leaderboardAPI.getTopReferrers(10, currentPage),
        leaderboardAPI.getOverall(10, currentPage),
        leaderboardAPI.getStats()
      ])

      setData({
        topDonors: donorsRes.data.topDonors,
        topReferrers: referrersRes.data.topReferrers,
        overallLeaders: overallRes.data.overallLeaders,
        stats: statsRes.data
      })

      // Set pagination based on active tab
      if (activeTab === 'donors') {
        setPagination(donorsRes.data.pagination)
      } else if (activeTab === 'referrers') {
        setPagination(referrersRes.data.pagination)
      } else {
        setPagination(overallRes.data.pagination)
      }
    } catch (error) {
      console.error('Failed to load leaderboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentData = () => {
    if (!data) return []
    
    switch (activeTab) {
      case 'donors':
        return data.topDonors
      case 'referrers':
        return data.topReferrers
      case 'overall':
        return data.overallLeaders
      default:
        return []
    }
  }

  const getTabIcon = (tab: LeaderboardType) => {
    switch (tab) {
      case 'donors':
        return <Trophy className="h-4 w-4" />
      case 'referrers':
        return <Users className="h-4 w-4" />
      case 'overall':
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-warning-500" />
      case 2:
        return <Medal className="h-5 w-5 text-secondary-400" />
      case 3:
        return <Star className="h-5 w-5 text-warning-400" />
      default:
        return null
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-warning-50 border-warning-200'
      case 2:
        return 'bg-secondary-50 border-secondary-200'
      case 3:
        return 'bg-warning-50 border-warning-200'
      default:
        return 'bg-white border-secondary-200'
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Leaderboard</h1>
          <p className="text-secondary-600">See who's making the biggest impact</p>
        </div>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-primary-100">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Users</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {data.stats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-success-100">
                <Trophy className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Donations</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {formatCurrency(data.stats.totalDonations)}
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
                <p className="text-sm font-medium text-secondary-600">Avg Donations</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {formatCurrency(data.stats.avgDonations)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-secondary-100">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Referrals</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {data.stats.totalReferrals}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'donors', name: 'Top Donors' },
            { id: 'referrers', name: 'Top Referrers' },
            { id: 'overall', name: 'Overall Leaders' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as LeaderboardType)
                setCurrentPage(1)
              }}
              className={cn(
                'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              )}
            >
              {getTabIcon(tab.id as LeaderboardType)}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Leaderboard */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {getCurrentData().map((entry, index) => {
              const rank = (currentPage - 1) * 10 + index + 1
              return (
                <div
                  key={entry.referralCode}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border transition-all',
                    getRankColor(rank)
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-secondary-600 w-8">
                        #{rank}
                      </span>
                      {getRankIcon(rank)}
                    </div>
                    
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm',
                        generateAvatarColor(entry.name)
                      )}
                    >
                      {getInitials(entry.name)}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-secondary-900">{entry.name}</h3>
                      <p className="text-sm text-secondary-500 font-mono">
                        {entry.referralCode}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {activeTab === 'donors' && (
                      <div>
                        <p className="text-lg font-bold text-secondary-900">
                          {formatCurrency(entry.totalDonations)}
                        </p>
                        <p className="text-sm text-secondary-500">Total Donations</p>
                      </div>
                    )}
                    
                    {activeTab === 'referrers' && (
                      <div>
                        <p className="text-lg font-bold text-secondary-900">
                          {entry.referralCount}
                        </p>
                        <p className="text-sm text-secondary-500">Referrals</p>
                        <p className="text-xs text-secondary-400">
                          {formatCurrency(entry.totalReferralDonations || 0)} from referrals
                        </p>
                      </div>
                    )}
                    
                    {activeTab === 'overall' && (
                      <div>
                        <p className="text-lg font-bold text-secondary-900">
                          {Math.round(entry.overallScore || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-secondary-500">Overall Score</p>
                        <p className="text-xs text-secondary-400">
                          {formatCurrency(entry.totalDonations)} + {entry.referralCount || 0} referrals
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-secondary-200">
            <div className="text-sm text-secondary-600">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrev}
                className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNext}
                className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 