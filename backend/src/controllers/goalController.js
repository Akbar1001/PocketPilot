const pool = require("../config/database");


// ==========================================
// CREATE GOAL
// ==========================================

const createGoal = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            name,
            targetAmount,
            currentAmount,
            targetDate
        } = req.body;


        // Validate required fields

        if (!name || targetAmount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Goal name and target amount are required"
            });
        }


        // Convert amounts to numbers

        const target = Number(targetAmount);

        const current =
            currentAmount === undefined ||
            currentAmount === ""
                ? 0
                : Number(currentAmount);


        // Validate numbers

        if (Number.isNaN(target) || target <= 0) {
            return res.status(400).json({
                success: false,
                message: "Target amount must be greater than 0"
            });
        }


        if (Number.isNaN(current) || current < 0) {
            return res.status(400).json({
                success: false,
                message: "Current amount cannot be negative"
            });
        }


        if (current > target) {
            return res.status(400).json({
                success: false,
                message: "Current amount cannot be greater than target amount"
            });
        }


        const result = await pool.query(
            `INSERT INTO goals
                (
                    user_id,
                    name,
                    target_amount,
                    current_amount,
                    target_date
                )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING
                id,
                name,
                target_amount,
                current_amount,
                target_date,
                created_at`,
            [
                userId,
                name.trim(),
                target,
                current,
                targetDate || null
            ]
        );


        return res.status(201).json({
            success: true,
            message: "Goal created successfully",
            goal: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create goal error:", 
            error
        ); 

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ==========================================
// GET ALL GOALS
// ==========================================

const getGoals = async (req, res) => {
    try {

        const userId = req.user.id;


        const result = await pool.query(
            `SELECT
                id,
                name,
                target_amount,
                current_amount,
                target_date,
                created_at
             FROM goals
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );


        return res.status(200).json({
            success: true,
            goals: result.rows
        });

    } catch (error) {

        console.error(
            "Get goals error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ==========================================
// GET GOAL BY ID
// ==========================================

const getGoalById = async (req, res) => {
    try {

        const userId = req.user.id;

        const goalId = req.params.id;


        const result = await pool.query(
            `SELECT
                id,
                name,
                target_amount,
                current_amount,
                target_date,
                created_at
             FROM goals
             WHERE id = $1
             AND user_id = $2`,
            [
                goalId,
                userId
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }


        return res.status(200).json({
            success: true,
            goal: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get goal error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ==========================================
// UPDATE GOAL
// ==========================================

const updateGoal = async (req, res) => {
    try {

        const userId = req.user.id;

        const goalId = req.params.id;


        const {
            name,
            targetAmount,
            currentAmount,
            targetDate
        } = req.body;


        if (!name || targetAmount === undefined) {

            return res.status(400).json({
                success: false,
                message: "Goal name and target amount are required"
            });
        }


        const target = Number(targetAmount);

        const current =
            currentAmount === undefined ||
            currentAmount === ""
                ? 0
                : Number(currentAmount);


        if (Number.isNaN(target) || target <= 0) {

            return res.status(400).json({
                success: false,
                message: "Target amount must be greater than 0"
            });
        }


        if (Number.isNaN(current) || current < 0) {

            return res.status(400).json({
                success: false,
                message: "Current amount cannot be negative"
            });
        }


        if (current > target) {

            return res.status(400).json({
                success: false,
                message: "Current amount cannot be greater than target amount"
            });
        }


        const result = await pool.query(
            `UPDATE goals
             SET
                name = $1,
                target_amount = $2,
                current_amount = $3,
                target_date = $4
             WHERE id = $5
             AND user_id = $6
             RETURNING
                id,
                name,
                target_amount,
                current_amount,
                target_date,
                created_at`,
            [
                name.trim(),
                target,
                current,
                targetDate || null,
                goalId,
                userId
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }


        return res.status(200).json({
            success: true,
            message: "Goal updated successfully",
            goal: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update goal error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ==========================================
// DELETE GOAL
// ==========================================

const deleteGoal = async (req, res) => {
    try {

        const userId = req.user.id;

        const goalId = req.params.id;


        const result = await pool.query(
            `DELETE FROM goals
             WHERE id = $1
             AND user_id = $2
             RETURNING id`,
            [
                goalId,
                userId
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }


        return res.status(200).json({
            success: true,
            message: "Goal deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete goal error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createGoal,
    getGoals,
    getGoalById,
    updateGoal,
    deleteGoal
};