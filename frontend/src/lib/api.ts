import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong'
    
    // Handle different error types
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('Access denied')
    } else if (error.response?.status === 404) {
      toast.error('Resource not found')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// API helper functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  signup: (name: string, email: string, password: string, referralCode?: string) =>
    api.post('/auth/signup', { name, email, password, referralCode }),
  
  me: () => api.get('/auth/me'),
  
  validateReferral: (referralCode: string) =>
    api.post('/auth/validate-referral', { referralCode }),
}

export const dashboardAPI = {
  getProfile: () => api.get('/dashboard/profile'),
  
  updateDonations: (amount: number) =>
    api.post('/dashboard/update-donations', { amount }),
  
  getReferrals: () => api.get('/dashboard/referrals'),
  
  getRewards: () => api.get('/dashboard/rewards'),
  
  shareReferral: () => api.post('/dashboard/share-referral'),
}

export const leaderboardAPI = {
  getTopDonors: (limit = 10, page = 1) =>
    api.get('/leaderboard/top-donors', { params: { limit, page } }),
  
  getTopReferrers: (limit = 10, page = 1) =>
    api.get('/leaderboard/top-referrers', { params: { limit, page } }),
  
  getOverall: (limit = 10, page = 1) =>
    api.get('/leaderboard/overall', { params: { limit, page } }),
  
  getStats: () => api.get('/leaderboard/stats'),
} 