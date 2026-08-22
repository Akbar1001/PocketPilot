const bcrypt = require("bcrypt");

const pool = require("../config/database");


// ==========================================
// GET CURRENT USER
// ==========================================

const getCurrentUser = async (req, res) => {
    try {

        const userId = req.user.id;

        const result = await pool.query(
            `SELECT
                id,
                name,
                email,
                created_at
             FROM users
             WHERE id = $1`,
            [userId]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        return res.status(200).json({
            success: true,
            user: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};



// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        const { name } = req.body;


        // Validate name
        if (!name || !name.trim()) {

            return res.status(400).json({
                success: false,
                message: "Name cannot be empty"
            });

        }


        const result = await pool.query(
            `UPDATE users
             SET name = $1
             WHERE id = $2
             RETURNING
                id,
                name,
                email,
                created_at`,
            [
                name.trim(),
                userId
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};



// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;


        // --------------------------------------
        // Validate fields
        // --------------------------------------

        if (!currentPassword || !newPassword) {

            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });

        }


        // --------------------------------------
        // Validate new password
        // --------------------------------------

        if (newPassword.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "New password must contain at least 6 characters"
            });

        }


        // --------------------------------------
        // Get existing password hash
        // --------------------------------------

        const result = await pool.query(
            `SELECT password_hash
             FROM users
             WHERE id = $1`,
            [userId]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        const user = result.rows[0];


        // --------------------------------------
        // Verify current password
        // --------------------------------------

        const isPasswordValid =
            await bcrypt.compare(
                currentPassword,
                user.password_hash
            );


        if (!isPasswordValid) {

            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });

        }


        // --------------------------------------
        // Hash new password
        // --------------------------------------

        const newPasswordHash =
            await bcrypt.hash(
                newPassword,
                12
            );


        // --------------------------------------
        // Update password
        // --------------------------------------

        await pool.query(
            `UPDATE users
             SET password_hash = $1
             WHERE id = $2`,
            [
                newPasswordHash,
                userId
            ]
        );


        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });


    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};



module.exports = {
    getCurrentUser,
    updateProfile,
    changePassword
};