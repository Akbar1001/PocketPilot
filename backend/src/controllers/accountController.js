const pool = require("../config/database");


// ======================================================
// CREATE ACCOUNT
// ======================================================

const createAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            name,
            type,
            initialBalance
        } = req.body;


        // ----------------------------------------------
        // Validate account name and type
        // ----------------------------------------------

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "Account name and type are required"
            });
        }


        // ----------------------------------------------
        // Validate initial balance
        // ----------------------------------------------

        const balance = Number(initialBalance || 0);


        if (Number.isNaN(balance) || balance < 0) {
            return res.status(400).json({
                success: false,
                message: "Initial balance must be a valid non-negative number"
            });
        }


        // ----------------------------------------------
        // Create account
        // ----------------------------------------------

        const result = await pool.query(
            `INSERT INTO accounts
                (user_id, name, type, balance)
             VALUES
                ($1, $2, $3, $4)
             RETURNING
                id,
                name,
                type,
                balance,
                created_at`,
            [
                userId,
                name,
                type,
                balance
            ]
        );


        // ----------------------------------------------
        // Send response
        // ----------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            account: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create account error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ======================================================
// GET ALL ACCOUNTS
// ======================================================

const getAccounts = async (req, res) => {
    try {

        const userId = req.user.id;


        const result = await pool.query(
            `SELECT
                id,
                name,
                type,
                balance,
                created_at
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

        console.error(
            "Get accounts error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ======================================================
// GET SINGLE ACCOUNT
// ======================================================

const getAccountById = async (req, res) => {
    try {

        const userId = req.user.id;
        const accountId = req.params.id;


        const result = await pool.query(
            `SELECT
                id,
                name,
                type,
                balance,
                created_at
             FROM accounts
             WHERE id = $1
             AND user_id = $2`,
            [
                accountId,
                userId
            ]
        );


        // ----------------------------------------------
        // Account not found
        // ----------------------------------------------

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

        console.error(
            "Get account error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ======================================================
// UPDATE ACCOUNT
// ======================================================

const updateAccount = async (req, res) => {
    try {

        const userId = req.user.id;
        const accountId = req.params.id;


        const {
            name,
            type,
            balance
        } = req.body;


        // ----------------------------------------------
        // Validate name and type
        // ----------------------------------------------

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "Account name and type are required"
            });
        }


        // ----------------------------------------------
        // Determine whether balance was supplied
        // ----------------------------------------------

        let newBalance = null;

        if (
            balance !== undefined &&
            balance !== null &&
            balance !== ""
        ) {

            newBalance = Number(balance);

            if (
                Number.isNaN(newBalance) ||
                newBalance < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Balance must be a valid non-negative number"
                });
            }
        }


        // ----------------------------------------------
        // Update account
        //
        // If balance is supplied:
        //     update name + type + balance
        //
        // Otherwise:
        //     update only name + type
        // ----------------------------------------------

        let result;


        if (newBalance !== null) {

            result = await pool.query(
                `UPDATE accounts
                 SET
                    name = $1,
                    type = $2,
                    balance = $3
                 WHERE id = $4
                 AND user_id = $5
                 RETURNING
                    id,
                    name,
                    type,
                    balance,
                    created_at`,
                [
                    name,
                    type,
                    newBalance,
                    accountId,
                    userId
                ]
            );

        } else {

            result = await pool.query(
                `UPDATE accounts
                 SET
                    name = $1,
                    type = $2
                 WHERE id = $3
                 AND user_id = $4
                 RETURNING
                    id,
                    name,
                    type,
                    balance,
                    created_at`,
                [
                    name,
                    type,
                    accountId,
                    userId
                ]
            );
        }


        // ----------------------------------------------
        // Account not found
        // ----------------------------------------------

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

        console.error(
            "Update account error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ======================================================
// DELETE ACCOUNT
// ======================================================

const deleteAccount = async (req, res) => {
    try {

        const userId = req.user.id;
        const accountId = req.params.id;


        const result = await pool.query(
            `DELETE FROM accounts
             WHERE id = $1
             AND user_id = $2
             RETURNING id`,
            [
                accountId,
                userId
            ]
        );


        // ----------------------------------------------
        // Account not found
        // ----------------------------------------------

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

        console.error(
            "Delete account error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
 


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
    createAccount,
    getAccounts,
    getAccountById,
    updateAccount,
    deleteAccount
};