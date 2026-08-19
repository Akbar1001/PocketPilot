const pool = require("../config/database");

//Create Cataegory Controller
const createCategory = async (req, res) => {
    try {
        const userId = req.user.id;

        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "Category name and type are required"
            });
        }

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Category type must be income or expense"
            });
        }

        const result = await pool.query(
            `INSERT INTO categories
             (user_id, name, type)
             VALUES ($1, $2, $3)
             RETURNING id, name, type, created_at`,
            [userId, name, type]
        );

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category: result.rows[0]
        });

    } catch (error) {
        console.error("Create category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get Cataegories controller
const getCategories = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, name, type, user_id, created_at
             FROM categories
             WHERE user_id IS NULL
                OR user_id = $1
             ORDER BY
                CASE
                    WHEN user_id IS NULL THEN 0
                    ELSE 1
                END,
                name ASC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            categories: result.rows
        });

    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//Update Cataegory controller
const updateCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const categoryId = req.params.id;

        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "Category name and type are required"
            });
        }

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Category type must be income or expense"
            });
        }

        const result = await pool.query(
            `UPDATE categories
             SET name = $1,
                 type = $2
             WHERE id = $3
               AND user_id = $4
             RETURNING id, name, type, created_at`,
            [name, type, categoryId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found or cannot be modified"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: result.rows[0]
        });

    } catch (error) {
        console.error("Update category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete Cataegory 
const deleteCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const categoryId = req.params.id;

        const result = await pool.query(
            `DELETE FROM categories
             WHERE id = $1
               AND user_id = $2
             RETURNING id`,
            [categoryId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found or cannot be deleted"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};