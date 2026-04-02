const express = require('express');
const router = express.Router();
const { revenueByMonth, topProducts, categoryStats, topCustomers } = require('../models/dashboard');

router.get('/revenue', async (req, res, next) => { try { res.json(await revenueByMonth()); } catch (e) { next(e); } });
router.get('/top-products', async (req, res, next) => { try { res.json(await topProducts()); } catch (e) { next(e); } });
router.get('/category-stats', async (req, res, next) => { try { res.json(await categoryStats()); } catch (e) { next(e); } });
router.get('/top-customers', async (req, res, next) => { try { res.json(await topCustomers()); } catch (e) { next(e); } });

module.exports = router;