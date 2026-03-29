const express = require('express');
const router = express.Router();
const { Order } = require('../models');

// GET /api/dashboard/revenue
// Total revenue and order count grouped by month for the current year
router.get('/revenue', async (req, res, next) => {
  try {
    const year = new Date().getFullYear();

    const result = await Order.aggregate([
      // Stage 1: filter to current year's delivered orders only
      {
        $match: {
          status:    'delivered',
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt:  new Date(`${year + 1}-01-01`),
          },
        },
      },
      // Stage 2: group by month — $month extracts the month number (1–12) from a Date
      {
        $group: {
          _id:     { $month: '$createdAt' },
          revenue: { $sum: '$total' },
          orders:  { $sum: 1 },
        },
      },
      // Stage 3: sort chronologically
      { $sort: { _id: 1 } },
      // Stage 4: clean up the output — rename _id to month
      {
        $project: {
          _id:     0,
          month:   '$_id',
          revenue: { $round: ['$revenue', 2] },
          orders:  1,
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/top-products
// Top 5 products by quantity sold across all delivered orders
router.get('/top-products', async (req, res, next) => {
  try {
    const result = await Order.aggregate([
      // Stage 1: only look at delivered orders
      { $match: { status: 'delivered' } },

      // Stage 2: $unwind turns the lineItems array into individual documents.
      // An order with 3 line items becomes 3 separate documents, each with one lineItem.
      { $unwind: '$lineItems' },

      // Stage 3: group by product name, sum quantity sold and revenue
      {
        $group: {
          _id:          '$lineItems.name',
          totalSold:    { $sum: '$lineItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$lineItems.price', '$lineItems.quantity'] } },
        },
      },

      // Stage 4: sort by quantity sold descending
      { $sort: { totalSold: -1 } },

      // Stage 5: only the top 5
      { $limit: 5 },

      // Stage 6: clean output
      {
        $project: {
          _id:          0,
          name:         '$_id',
          totalSold:    1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/users
// Per user: total orders and total spend, sorted by spend descending
router.get('/users', async (req, res, next) => {
  try {
    const result = await Order.aggregate([
      // Stage 1: group all orders by userId
      {
        $group: {
          _id:        '$userId',
          totalOrders: { $sum: 1 },
          totalSpend:  { $sum: '$total' },
        },
      },

      // Stage 2: $lookup joins the 'users' collection on userId
      // This is the MongoDB equivalent of a LEFT JOIN
      {
        $lookup: {
          from:         'users',   // the collection name (always lowercase plural in MongoDB)
          localField:   '_id',     // field in the current aggregation document
          foreignField: '_id',     // field in the 'users' collection
          as:           'user',    // result is put into an array called 'user'
        },
      },

      // Stage 3: $unwind the 'user' array into a single object
      // $lookup always returns an array; $unwind flattens it
      { $unwind: '$user' },

      // Stage 4: sort by spend descending
      { $sort: { totalSpend: -1 } },

      // Stage 5: reshape output for the client
      {
        $project: {
          _id:         0,
          userId:      '$_id',
          name:        '$user.name',
          email:       '$user.email',
          totalOrders: 1,
          totalSpend:  { $round: ['$totalSpend', 2] },
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
