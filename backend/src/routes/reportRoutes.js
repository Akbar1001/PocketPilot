const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
    getReportSummary
} = require("../controllers/reportController");

const router = express.Router();

router.get("/summary", authenticate, getReportSummary);

module.exports = router;