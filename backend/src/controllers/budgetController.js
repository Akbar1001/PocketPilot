const pool = require("../config/database");


// =====================================================
// CREATE BUDGET
// =====================================================

const createBudget = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            category_id,
            amount,
            period,
            start_date
        } = req.body;


        // Validate required fields

        if (
            !category_id ||
            !amount ||
            !period ||
            !start_date
        ) {
            return res.status(400).json({
                success: false,
                message: "Category, amount, period and start date are required"
            });
        }


        // Validate amount

        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Budget amount must be greater than 0"
            });
        }


        // Validate period

        if (!["weekly", "monthly"].includes(period)) {
            return res.status(400).json({
                success: false,
                message: "Period must be weekly or monthly"
            });
        }


        // Make sure category belongs to user
        // OR is a default category

        const categoryResult = await pool.query(
            `
            SELECT id, name, type
            FROM categories
            WHERE id = $1
            AND (
                user_id IS NULL
                OR user_id = $2
            )
            `,
            [category_id, userId]
        );


        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }


        const category = categoryResult.rows[0];


        // Budgets should normally be for expenses

        if (category.type !== "expense") {
            return res.status(400).json({
                success: false,
                message: "Budget category must be an expense category"
            });
        }


        // Create budget

        const result = await pool.query(
            `
            INSERT INTO budgets
            (
                user_id,
                category_id,
                amount,
                period,
                start_date
            )
            VALUES ($1, $2, $3, $4, $5)

            RETURNING
                id,
                user_id,
                category_id,
                amount,
                period,
                start_date,
                created_at,
                updated_at
            `,
            [
                userId,
                category_id,
                amount,
                period,
                start_date
            ]
        );


        return res.status(201).json({
            success: true,
            message: "Budget created successfully",
            budget: {
                ...result.rows[0],
                category_name: category.name
            }
        });


    } catch (error) {

        console.error("Create budget error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// =====================================================
// GET ALL BUDGETS
// =====================================================

const getBudgets = async (req, res) => {

    try {

        const userId = req.user.id;


        const result = await pool.query(
            `
            SELECT
                b.id,
                b.user_id,
                b.category_id,
                b.amount,
                b.period,
                b.start_date,
                b.created_at,
                b.updated_at,

                c.name AS category_name

            FROM budgets b

            JOIN categories c
                ON b.category_id = c.id

            WHERE b.user_id = $1

            ORDER BY b.start_date DESC, b.created_at DESC
            `,
            [userId]
        );


        return res.status(200).json({
            success: true,
            budgets: result.rows
        });


    } catch (error) {

        console.error("Get budgets error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// =====================================================
// GET SINGLE BUDGET
// =====================================================

const getBudgetById = async (req, res) => {

    try {

        const userId = req.user.id;
        const budgetId = req.params.id;


        const result = await pool.query(
            `
            SELECT
                b.id,
                b.user_id,
                b.category_id,
                b.amount,
                b.period,
                b.start_date,
                b.created_at,
                b.updated_at,

                c.name AS category_name

            FROM budgets b

            JOIN categories c
                ON b.category_id = c.id

            WHERE b.id = $1
            AND b.user_id = $2
            `,
            [
                budgetId,
                userId
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }


        return res.status(200).json({
            success: true,
            budget: result.rows[0]
        });


    } catch (error) {

        console.error("Get budget error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// =====================================================
// UPDATE BUDGET
// =====================================================

const updateBudget = async (req, res) => {

    try {

        const userId = req.user.id;
        const budgetId = req.params.id;


        const {
            category_id,
            amount,
            period,
            start_date
        } = req.body;


        // Validate

        if (
            !category_id ||
            !amount ||
            !period ||
            !start_date
        ) {
            return res.status(400).json({
                success: false,
                message: "Category, amount, period and start date are required"
            });
        }


        if (Number(amount) <= 0) {

            return res.status(400).json({
                success: false,
                message: "Budget amount must be greater than 0"
            });
        }


        if (!["weekly", "monthly"].includes(period)) {

            return res.status(400).json({
                success: false,
                message: "Period must be weekly or monthly"
            });
        }


        // Check category

        const categoryResult = await pool.query(
            `
            SELECT id, name, type
            FROM categories
            WHERE id = $1
            AND (
                user_id IS NULL
                OR user_id = $2
            )
            `,
            [
                category_id,
                userId
            ]
        );


        if (categoryResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }


        const category = categoryResult.rows[0];


        if (category.type !== "expense") {

            return res.status(400).json({
                success: false,
                message: "Budget category must be an expense category"
            });
        }


        // Update

        const result = await pool.query(
            `
            UPDATE budgets

            SET
                category_id = $1,
                amount = $2,
                period = $3,
                start_date = $4,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $5
            AND user_id = $6

            RETURNING
                id,
                user_id,
                category_id,
                amount,
                period,
                start_date,
                created_at,
                updated_at
            `,
            [
                category_id,
                amount,
                period,
                start_date,
                budgetId,
                userId
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }


        return res.status(200).json({
            success: true,
            message: "Budget updated successfully",
            budget: {
                ...result.rows[0],
                category_name: category.name
            }
        });


    } catch (error) {

        console.error("Update budget error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// =====================================================
// DELETE BUDGET
// =====================================================

const deleteBudget = async (req, res) => {

    try {

        const userId = req.user.id;
        const budgetId = req.params.id;


        const result = await pool.query(
            `
            DELETE FROM budgets

            WHERE id = $1
            AND user_id = $2

            RETURNING id
            `,
            [
                budgetId,
                userId
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }


        return res.status(200).json({
            success: true,
            message: "Budget deleted successfully"
        });


    } catch (error) {

        console.error("Delete budget error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget
};