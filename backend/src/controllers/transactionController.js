const pool = require("../config/database");

// Creating a transaction
const createTransaction = async (req, res) => {
    const client = await pool.connect();

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

        // -----------------------------
        // 1. Validate input
        // -----------------------------

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

        // -----------------------------
        // 2. Start database transaction
        // -----------------------------

        await client.query("BEGIN");

        // -----------------------------
        // 3. Check account ownership
        // -----------------------------

        const accountResult = await client.query(
            `SELECT id, balance
             FROM accounts
             WHERE id = $1
               AND user_id = $2
             FOR UPDATE`,
            [accountId, userId]
        );

        if (accountResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        // -----------------------------
        // 4. Check category ownership
        // -----------------------------

        const categoryResult = await client.query(
            `SELECT id
             FROM categories
             WHERE id = $1
               AND (user_id IS NULL OR user_id = $2)`,
            [categoryId, userId]
        );

        if (categoryResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // -----------------------------
        // 5. Insert transaction
        // -----------------------------

        const transactionResult = await client.query(
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

        // -----------------------------
        // 6. Update account balance
        // -----------------------------

        if (type === "income") {
            await client.query(
                `UPDATE accounts
                 SET balance = balance + $1
                 WHERE id = $2
                   AND user_id = $3`,
                [amount, accountId, userId]
            );
        } else {
            await client.query(
                `UPDATE accounts
                 SET balance = balance - $1
                 WHERE id = $2
                   AND user_id = $3`,
                [amount, accountId, userId]
            );
        }

        // -----------------------------
        // 7. Commit everything
        // -----------------------------

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            transaction: transactionResult.rows[0]
        });

    } catch (error) {

        // -----------------------------
        // 8. Rollback on error
        // -----------------------------

        await client.query("ROLLBACK");

        console.error("Create transaction error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    } finally {

        // -----------------------------
        // 9. Release connection
        // -----------------------------

        client.release();
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
    const client = await pool.connect();

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

        await client.query("BEGIN");

        // Get old transaction
        const oldTransactionResult = await client.query(
            `SELECT *
             FROM transactions
             WHERE id = $1
               AND user_id = $2
             FOR UPDATE`,
            [transactionId, userId]
        );

        if (oldTransactionResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const oldTransaction = oldTransactionResult.rows[0];

        // Check new account
        const accountResult = await client.query(
            `SELECT id
             FROM accounts
             WHERE id = $1
               AND user_id = $2
             FOR UPDATE`,
            [accountId, userId]
        );

        if (accountResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        // Check category
        const categoryResult = await client.query(
            `SELECT id
             FROM categories
             WHERE id = $1
               AND (user_id IS NULL OR user_id = $2)`,
            [categoryId, userId]
        );

        if (categoryResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Reverse old transaction effect
        if (oldTransaction.type === "income") {
            await client.query(
                `UPDATE accounts
                 SET balance = balance - $1
                 WHERE id = $2
                   AND user_id = $3`,
                [
                    oldTransaction.amount,
                    oldTransaction.account_id,
                    userId
                ]
            );
        } else {
            await client.query(
                `UPDATE accounts
                 SET balance = balance + $1
                 WHERE id = $2
                   AND user_id = $3`,
                [
                    oldTransaction.amount,
                    oldTransaction.account_id,
                    userId
                ]
            );
        }

        // Update transaction
        const updatedTransactionResult = await client.query(
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

        // Apply new transaction effect
        if (type === "income") {
            await client.query(
                `UPDATE accounts
                 SET balance = balance + $1
                 WHERE id = $2
                   AND user_id = $3`,
                [amount, accountId, userId]
            );
        } else {
            await client.query(
                `UPDATE accounts
                 SET balance = balance - $1
                 WHERE id = $2
                   AND user_id = $3`,
                [amount, accountId, userId]
            );
        }

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            transaction: updatedTransactionResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Update transaction error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    } finally {
        client.release();
    }
};


//Delete Transaction
const deleteTransaction = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.id;
        const transactionId = req.params.id;

        await client.query("BEGIN");

        const transactionResult = await client.query(
            `SELECT *
             FROM transactions
             WHERE id = $1
               AND user_id = $2
             FOR UPDATE`,
            [transactionId, userId]
        );

        if (transactionResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const transaction = transactionResult.rows[0];

        // Reverse the transaction's effect
        if (transaction.type === "income") {
            await client.query(
                `UPDATE accounts
                 SET balance = balance - $1
                 WHERE id = $2
                   AND user_id = $3`,
                [
                    transaction.amount,
                    transaction.account_id,
                    userId
                ]
            );
        } else {
            await client.query(
                `UPDATE accounts
                 SET balance = balance + $1
                 WHERE id = $2
                   AND user_id = $3`,
                [
                    transaction.amount,
                    transaction.account_id,
                    userId
                ]
            );
        }

        // Delete transaction
        await client.query(
            `DELETE FROM transactions
             WHERE id = $1
               AND user_id = $2`,
            [transactionId, userId]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Delete transaction error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    } finally {
        client.release();
    }
};


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};