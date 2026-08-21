const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget
} = require("../controllers/budgetController");


const router = express.Router();


// Create budget

router.post(
    "/",
    authenticate,
    createBudget
);


// Get all budgets

router.get(
    "/",
    authenticate,
    getBudgets
);


// Get single budget

router.get(
    "/:id",
    authenticate,
    getBudgetById
);


// Update budget

router.put(
    "/:id",
    authenticate,
    updateBudget
);


// Delete budget

router.delete(
    "/:id",
    authenticate,
    deleteBudget
);


module.exports = router;