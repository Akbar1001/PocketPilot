const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
    createAccount,
    getAccounts,
    getAccountById,
    updateAccount,
    deleteAccount
} = require("../controllers/accountController");

const router = express.Router();

router.post("/", authenticate, createAccount);

router.get("/", authenticate, getAccounts);

router.get("/:id", authenticate, getAccountById);

router.put("/:id", authenticate, updateAccount);

router.delete("/:id", authenticate, deleteAccount);

module.exports = router;