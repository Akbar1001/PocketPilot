const pool = require("../config/database");


// Get financial report summary
const getReportSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Total income
        const incomeResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total
             FROM transactions
             WHERE user_id = $1
             AND type = 'income'`,
            [userId]
        );

        // Total expenses
        const expenseResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total
             FROM transactions
             WHERE user_id = $1
             AND type = 'expense'`,
            [userId]
        );

        // Transactions by category
        const categoryResult = await pool.query(
            `SELECT
                c.id,
                c.name,
                c.type,
                COALESCE(SUM(t.amount), 0) AS total
             FROM categories c
             LEFT JOIN transactions t
                ON t.category_id = c.id
                AND t.user_id = $1
             WHERE c.user_id IS NULL
                OR c.user_id = $1
             GROUP BY c.id, c.name, c.type
             ORDER BY total DESC`,
            [userId]
        );

        const totalIncome =
            Number(incomeResult.rows[0].total) || 0;

        const totalExpenses =
            Number(expenseResult.rows[0].total) || 0;

        const balance =
            totalIncome - totalExpenses;

        return res.status(200).json({
            success: true,

            summary: {
                totalIncome,
                totalExpenses,
                balance
            },

            categories: categoryResult.rows
        });

    } catch (error) {

        console.error(
            "Get report summary error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    getReportSummary
};