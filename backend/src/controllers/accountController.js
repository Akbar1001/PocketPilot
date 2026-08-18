const pool = require("../config/database");


// create an account
const createAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "Account name and type are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO accounts (user_id, name, type)
             VALUES ($1, $2, $3)
             RETURNING id, name, type, created_at`,
            [userId, name, type]
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            account: result.rows[0]
        });

    } catch (error) {
        console.error("Create account error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// get account details
const getAccounts = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, name, type, created_at
             FROM accounts
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            accounts: result.rows
        });

    } catch (error) {
        console.error("Get accounts error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const getAccountById = async (req, res) => {
    try {
        const userId = req.user.id;
        const accountId = req.params.id;

        const result = await pool.query(
            `SELECT id, name, type, created_at
             FROM accounts
             WHERE id = $1
             AND user_id = $2`,
            [accountId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        return res.status(200).json({
            success: true,
            account: result.rows[0]
        });

    } catch (error) {
        console.error("Get account error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Updating an account
const updateAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const accountId = req.params.id;

        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "Account name and type are required"
            });
        }

        const result = await pool.query(
            `UPDATE accounts
             SET name = $1,
                 type = $2
             WHERE id = $3
             AND user_id = $4
             RETURNING id, name, type, created_at`,
            [name, type, accountId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Account updated successfully",
            account: result.rows[0]
        });

    } catch (error) {
        console.error("Update account error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Deleting an Account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const accountId = req.params.id;

        const result = await pool.query(
            `DELETE FROM accounts
             WHERE id = $1
             AND user_id = $2
             RETURNING id`,
            [accountId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Delete account error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



module.exports = {
    createAccount,
    getAccounts,
    getAccountById,
    updateAccount,
    deleteAccount
};