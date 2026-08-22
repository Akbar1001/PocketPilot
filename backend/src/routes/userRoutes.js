const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
    getCurrentUser,
    updateProfile,
    changePassword
} = require("../controllers/userController");


const router = express.Router();



// ==========================================
// GET CURRENT USER
// ==========================================

router.get(
    "/me",
    authenticate,
    getCurrentUser
);



// ==========================================
// UPDATE PROFILE
// ==========================================

router.put(
    "/profile",
    authenticate,
    updateProfile
);



// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put(
    "/password",
    authenticate,
    changePassword
);



module.exports = router;