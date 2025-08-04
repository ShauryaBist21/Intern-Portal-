const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// @route   GET /api/dashboard/profile
// @desc    Get user profile and dashboard data
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('referredBy', 'name email');

    // Get referral count
    const referralCount = await User.countDocuments({ referredBy: user._id });

    // Get total donations from referrals
    const referrals = await User.find({ referredBy: user._id });
    const totalReferralDonations = referrals.reduce((sum, ref) => sum + ref.totalDonations, 0);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        totalDonations: user.totalDonations,
        rewards: user.rewards,
        referredBy: user.referredBy,
        referralCount,
        totalReferralDonations
      }
    });

  } catch (error) {
    console.error('Dashboard profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/dashboard/update-donations
// @desc    Update user's donation amount (for demo purposes)
// @access  Private
router.post('/update-donations', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount < 0) {
      return res.status(400).json({ error: 'Valid donation amount is required' });
    }

    const user = await User.findById(req.user._id);
    user.totalDonations += parseFloat(amount);

    // Check for reward unlocks based on donation milestones
    const rewards = [
      { name: 'Bronze Badge', description: 'First donation milestone', threshold: 100 },
      { name: 'Silver Badge', description: 'Consistent donor', threshold: 500 },
      { name: 'Gold Badge', description: 'Top contributor', threshold: 1000 },
      { name: 'Platinum Badge', description: 'Elite donor', threshold: 2500 },
      { name: 'Diamond Badge', description: 'Legendary contributor', threshold: 5000 }
    ];

    rewards.forEach(reward => {
      if (user.totalDonations >= reward.threshold) {
        const existingReward = user.rewards.find(r => r.name === reward.name);
        if (!existingReward) {
          user.rewards.push({
            name: reward.name,
            description: reward.description,
            unlocked: true,
            unlockedAt: new Date()
          });
        }
      }
    });

    await user.save();

    res.json({
      message: 'Donations updated successfully',
      totalDonations: user.totalDonations,
      rewards: user.rewards
    });

  } catch (error) {
    console.error('Update donations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/referrals
// @desc    Get user's referral list
// @access  Private
router.get('/referrals', authenticateToken, async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id })
      .select('name email totalDonations createdAt')
      .sort({ createdAt: -1 });

    res.json({ referrals });

  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/rewards
// @desc    Get user's rewards and available rewards
// @access  Private
router.get('/rewards', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const availableRewards = [
      { name: 'Bronze Badge', description: 'First donation milestone', threshold: 100, icon: '🥉' },
      { name: 'Silver Badge', description: 'Consistent donor', threshold: 500, icon: '🥈' },
      { name: 'Gold Badge', description: 'Top contributor', threshold: 1000, icon: '🥇' },
      { name: 'Platinum Badge', description: 'Elite donor', threshold: 2500, icon: '💎' },
      { name: 'Diamond Badge', description: 'Legendary contributor', threshold: 5000, icon: '💎' }
    ];

    // Mark which rewards are unlocked
    const rewardsWithStatus = availableRewards.map(reward => {
      const userReward = user.rewards.find(r => r.name === reward.name);
      return {
        ...reward,
        unlocked: userReward ? userReward.unlocked : false,
        unlockedAt: userReward ? userReward.unlockedAt : null,
        progress: Math.min((user.totalDonations / reward.threshold) * 100, 100)
      };
    });

    res.json({
      userRewards: user.rewards,
      availableRewards: rewardsWithStatus,
      totalDonations: user.totalDonations
    });

  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/dashboard/share-referral
// @desc    Generate shareable referral link
// @access  Private
router.post('/share-referral', authenticateToken, async (req, res) => {
  try {
    const shareableLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup?ref=${req.user.referralCode}`;
    
    res.json({
      referralCode: req.user.referralCode,
      shareableLink,
      message: 'Share this link with friends to earn rewards!'
    });

  } catch (error) {
    console.error('Share referral error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 