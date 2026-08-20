const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/", authenticate, createTransaction);


router.get("/:id", authenticate, getTransactionById);

router.put("/:id", authenticate, updateTransaction);

router.delete("/:id", authenticate, deleteTransaction);

module.exports = router;
