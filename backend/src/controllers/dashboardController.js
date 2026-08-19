const pool = require("../config/database");

const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Total balance across all accounts
        const balanceResult = await pool.query(
            `SELECT COALESCE(SUM(balance), 0) AS total_balance
             FROM accounts
             WHERE user_id = $1`,
            [userId]
        );

        // Total income
        const incomeResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total_income
             FROM transactions
             WHERE user_id = $1
               AND type = 'income'`,
            [userId]
        );

        // Total expenses
        const expenseResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total_expenses
             FROM transactions
             WHERE user_id = $1
               AND type = 'expense'`,
            [userId]
        );

        const totalBalance =
            Number(balanceResult.rows[0].total_balance);

        const totalIncome =
            Number(incomeResult.rows[0].total_income);

        const totalExpenses =
            Number(expenseResult.rows[0].total_expenses);

        const netIncome = totalIncome - totalExpenses;

        return res.status(200).json({
            success: true,
            summary: {
                totalBalance,
                totalIncome,
                totalExpenses,
                netIncome
            }
        });

    } catch (error) {
        console.error("Dashboard summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const getRecentTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT
                t.id,
                t.type,
                t.amount,
                t.description,
                t.transaction_date,

                a.name AS account_name,

                c.name AS category_name

             FROM transactions t

             INNER JOIN accounts a
                ON t.account_id = a.id

             INNER JOIN categories c
                ON t.category_id = c.id

             WHERE t.user_id = $1

             ORDER BY t.transaction_date DESC,
                      t.created_at DESC

             LIMIT 10`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            transactions: result.rows
        });

    } catch (error) {
        console.error("Recent transactions error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const getCategorySpending = async (req, res) => {
    try {
        const userId = req.user.id;

        const { startDate, endDate } = req.query;

        let query = `
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                COALESCE(SUM(t.amount), 0) AS total_spent

            FROM categories c

            LEFT JOIN transactions t
                ON c.id = t.category_id
               AND t.user_id = $1
               AND t.type = 'expense'
        `;

        const values = [userId];

        if (startDate && endDate) {
            query += `
                AND t.transaction_date
                BETWEEN $2 AND $3
            `;

            values.push(startDate, endDate);
        }

        query += `
            WHERE c.user_id IS NULL
               OR c.user_id = $1

            GROUP BY c.id, c.name

            ORDER BY total_spent DESC
        `;

        const result = await pool.query(query, values);

        return res.status(200).json({
            success: true,
            categories: result.rows
        });

    } catch (error) {
        console.error("Category spending error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getMonthlySummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT
                DATE_TRUNC('month', transaction_date) AS month,

                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'income'
                            THEN amount
                            ELSE 0
                        END
                    ), 0
                ) AS income,

                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'expense'
                            THEN amount
                            ELSE 0
                        END
                    ), 0
                ) AS expenses

             FROM transactions

             WHERE user_id = $1

             GROUP BY DATE_TRUNC(
                 'month',
                 transaction_date
             )

             ORDER BY month ASC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Monthly summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    getDashboardSummary,
    getRecentTransactions,
    getCategorySpending,
    getMonthlySummary,
    getCategorySpending,
};