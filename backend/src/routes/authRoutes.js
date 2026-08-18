const express = require("express");
const authenticate = require("../middleware/authMiddleware");


const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticate, (req, res) => {
    res.json({
        success: true,
        message: "You are authenticated",
        userId: req.user.id
    });
});


module.exports = router;