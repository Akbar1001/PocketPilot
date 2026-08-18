const express = require("express");
const authenticate = require("../middleware/authMiddleware");


const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
} = require("../controllers/authController");

const router = express.Router();

// Register route
router.post("/register", registerUser);
// Login Route
router.post("/login", loginUser);

router.get("/me", authenticate, (req, res) => {
    res.json({
        success: true,
        message: "You are authenticated",
        userId: req.user.id
    });
});

// Refresh token 
router.post("/refresh", refreshAccessToken);

// Logout Route
router.post("/logout", logoutUser);


module.exports = router;