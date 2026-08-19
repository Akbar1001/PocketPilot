const pool = require("../config/database");

// Creating a transaction
const createTransaction = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            accountId,
            categoryId,
            type,
            amount,
            description,
            transactionDate
        } = req.body;

        // 1. Validate required fields
        if (
            !accountId ||
            !categoryId ||
            !type ||
            !amount ||
            !transactionDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Account, category, type, amount and date are required"
            });
        }

        // 2. Validate transaction type
        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Transaction type must be income or expense"
            });
        }

        // 3. Validate amount
        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero"
            });
        }

        // 4. Check account ownership
        const accountResult = await pool.query(
            `SELECT id
             FROM accounts
             WHERE id = $1
               AND user_id = $2`,
            [accountId, userId]
        );

        if (accountResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        // 5. Check category ownership
        const categoryResult = await pool.query(
            `SELECT id
             FROM categories
             WHERE id = $1
               AND (user_id IS NULL OR user_id = $2)`,
            [categoryId, userId]
        );

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // 6. Create transaction
        const result = await pool.query(
            `INSERT INTO transactions
             (
                 user_id,
                 account_id,
                 category_id,
                 type,
                 amount,
                 description,
                 transaction_date
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING
                 id,
                 account_id,
                 category_id,
                 type,
                 amount,
                 description,
                 transaction_date,
                 created_at`,
            [
                userId,
                accountId,
                categoryId,
                type,
                amount,
                description || null,
                transactionDate
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            transaction: result.rows[0]
        });

    } catch (error) {
        console.error("Create transaction error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Get transactions
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT
                t.id,
                t.type,
                t.amount,
                t.description,
                t.transaction_date,
                t.created_at,

                a.id AS account_id,
                a.name AS account_name,

                c.id AS category_id,
                c.name AS category_name

             FROM transactions t

             INNER JOIN accounts a
                ON t.account_id = a.id

             INNER JOIN categories c
                ON t.category_id = c.id

             WHERE t.user_id = $1

             ORDER BY t.transaction_date DESC,
                      t.created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            transactions: result.rows
        });

    } catch (error) {
        console.error("Get transactions error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Get Transaction by Id
const getTransactionById = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;

        const result = await pool.query(
            `SELECT
                t.id,
                t.type,
                t.amount,
                t.description,
                t.transaction_date,
                t.created_at,

                a.id AS account_id,
                a.name AS account_name,

                c.id AS category_id,
                c.name AS category_name

             FROM transactions t

             INNER JOIN accounts a
                ON t.account_id = a.id

             INNER JOIN categories c
                ON t.category_id = c.id

             WHERE t.id = $1
               AND t.user_id = $2`,
            [transactionId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        return res.status(200).json({
            success: true,
            transaction: result.rows[0]
        });

    } catch (error) {
        console.error("Get transaction error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


//Update Transaction
const updateTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;

        const {
            accountId,
            categoryId,
            type,
            amount,
            description,
            transactionDate
        } = req.body;

        if (
            !accountId ||
            !categoryId ||
            !type ||
            !amount ||
            !transactionDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Account, category, type, amount and date are required"
            });
        }

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Transaction type must be income or expense"
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero"
            });
        }

        // Verify account ownership
        const accountResult = await pool.query(
            `SELECT id
             FROM accounts
             WHERE id = $1
               AND user_id = $2`,
            [accountId, userId]
        );

        if (accountResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        // Verify category ownership
        const categoryResult = await pool.query(
            `SELECT id
             FROM categories
             WHERE id = $1
               AND (user_id IS NULL OR user_id = $2)`,
            [categoryId, userId]
        );

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const result = await pool.query(
            `UPDATE transactions

             SET account_id = $1,
                 category_id = $2,
                 type = $3,
                 amount = $4,
                 description = $5,
                 transaction_date = $6

             WHERE id = $7
               AND user_id = $8

             RETURNING
                 id,
                 account_id,
                 category_id,
                 type,
                 amount,
                 description,
                 transaction_date,
                 created_at`,
            [
                accountId,
                categoryId,
                type,
                amount,
                description || null,
                transactionDate,
                transactionId,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            transaction: result.rows[0]
        });

    } catch (error) {
        console.error("Update transaction error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


//Delete Transaction
const deleteTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;

        const result = await pool.query(
            `DELETE FROM transactions
             WHERE id = $1
               AND user_id = $2
             RETURNING id`,
            [transactionId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        console.error("Delete transaction error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};




module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};