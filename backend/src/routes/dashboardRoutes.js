const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
    getDashboardSummary,
    getRecentTransactions,
    getCategorySpending,
    getMonthlySummary,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/summary", authenticate, getDashboardSummary);

router.get(
    "/recent-transactions",
    authenticate,
    getRecentTransactions
);

router.get(
    "/category-spending",
    authenticate,
    getCategorySpending
);

router.get(
    "/monthly-summary",
    authenticate,
    getMonthlySummary
);

module.exports = router;