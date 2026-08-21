const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
    createGoal,
    getGoals,
    getGoalById,
    updateGoal,
    deleteGoal
} = require("../controllers/goalController");


const router = express.Router();


// Create goal
router.post(
    "/",
    authenticate,
    createGoal
);


// Get all goals
router.get(
    "/",
    authenticate,
    getGoals
);


// Get single goal
router.get(
    "/:id",
    authenticate,
    getGoalById
);


// Update goal
router.put(
    "/:id",
    authenticate,
    updateGoal
);


// Delete goal
router.delete(
    "/:id",
    authenticate,
    deleteGoal
);


module.exports = router;