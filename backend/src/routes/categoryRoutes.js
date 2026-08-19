const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");


const router = express.Router();

router.post("/", authenticate, createCategory);

router.get("/", authenticate, getCategories);

router.put("/:id", authenticate, updateCategory);

router.delete("/:id", authenticate, deleteCategory);

module.exports = router;