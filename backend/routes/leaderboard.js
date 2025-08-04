const express = require('express');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/leaderboard/top-donors
// @desc    Get top donors by total donations
// @access  Public
router.get('/top-donors', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const topDonors = await User.find({ isActive: true })
      .select('name totalDonations referralCode rewards')
      .sort({ totalDonations: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalCount = await User.countDocuments({ isActive: true });

    res.json({
      topDonors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + topDonors.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Top donors error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/leaderboard/top-referrers
// @desc    Get top referrers by number of referrals
// @access  Public
router.get('/top-referrers', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Aggregate to get referral counts
    const topReferrers = await User.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $addFields: {
          referralCount: { $size: '$referrals' },
          totalReferralDonations: {
            $sum: '$referrals.totalDonations'
          }
        }
      },
      {
        $match: {
          isActive: true,
          referralCount: { $gt: 0 }
        }
      },
      {
        $project: {
          name: 1,
          referralCode: 1,
          referralCount: 1,
          totalReferralDonations: 1,
          totalDonations: 1
        }
      },
      {
        $sort: { referralCount: -1, totalReferralDonations: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const totalCount = await User.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $addFields: {
          referralCount: { $size: '$referrals' }
        }
      },
      {
        $match: {
          isActive: true,
          referralCount: { $gt: 0 }
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalCount.length > 0 ? totalCount[0].total : 0;

    res.json({
      topReferrers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCount: total,
        hasNext: skip + topReferrers.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Top referrers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/leaderboard/overall
// @desc    Get overall leaderboard combining donations and referrals
// @access  Public
router.get('/overall', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Calculate overall score based on donations and referrals
    const overallLeaders = await User.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $addFields: {
          referralCount: { $size: '$referrals' },
          totalReferralDonations: {
            $sum: '$referrals.totalDonations'
          },
          overallScore: {
            $add: [
              '$totalDonations',
              { $multiply: ['$referralCount', 50] }, // Bonus points for referrals
              { $multiply: ['$totalReferralDonations', 0.1] } // Bonus for referral donations
            ]
          }
        }
      },
      {
        $match: { isActive: true }
      },
      {
        $project: {
          name: 1,
          referralCode: 1,
          totalDonations: 1,
          referralCount: 1,
          totalReferralDonations: 1,
          overallScore: 1
        }
      },
      {
        $sort: { overallScore: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const totalCount = await User.countDocuments({ isActive: true });

    res.json({
      overallLeaders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + overallLeaders.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Overall leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/leaderboard/stats
// @desc    Get overall platform statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalDonations: { $sum: '$totalDonations' },
          avgDonations: { $avg: '$totalDonations' },
          maxDonations: { $max: '$totalDonations' }
        }
      }
    ]);

    const referralStats = await User.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $addFields: {
          referralCount: { $size: '$referrals' }
        }
      },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: '$referralCount' },
          usersWithReferrals: {
            $sum: { $cond: [{ $gt: ['$referralCount', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const result = {
      ...stats[0],
      ...referralStats[0],
      totalReferrals: referralStats[0]?.totalReferrals || 0,
      usersWithReferrals: referralStats[0]?.usersWithReferrals || 0
    };

    res.json(result);

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 