const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();


// GET current user
router.get("/me", authenticate, async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user
        });

    } catch (error) {
        console.error("Get user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


module.exports = router;