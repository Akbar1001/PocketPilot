import { useEffect, useState } from "react";
import api from "../api/axios";

import "./Goals.css";

function Goals() {

    const [goals, setGoals] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [editingGoal, setEditingGoal] = useState(null);

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        targetAmount: "",
        currentAmount: "",
        deadline: ""
    });


    // ==========================================
    // LOAD GOALS
    // ==========================================

    const loadGoals = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/goals");

            setGoals(response.data.goals || []);

        } catch (error) {

            console.error("Load goals error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load goals."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadGoals();

    }, []);


    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setFormError("");
    };


    // ==========================================
    // OPEN CREATE MODAL
    // ==========================================

    const openCreateModal = () => {

        setEditingGoal(null);

        setFormData({
            name: "",
            targetAmount: "",
            currentAmount: "",
            deadline: ""
        });

        setFormError("");
        setShowModal(true);
    };


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (goal) => {

        setEditingGoal(goal);

        setFormData({
            name: goal.name || "",
            targetAmount: goal.target_amount || "",
            currentAmount: goal.current_amount || "",
            deadline: goal.deadline
                ? goal.deadline.substring(0, 10)
                : ""
        });

        setFormError("");
        setShowModal(true);
    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingGoal(null);
        setFormError("");
    };


    // ==========================================
    // CREATE / UPDATE GOAL
    // ==========================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setFormError("");

        const name = formData.name.trim();

        const targetAmount =
            Number(formData.targetAmount);

        const currentAmount =
            Number(formData.currentAmount || 0);


        // Validation

        if (!name) {

            setFormError("Goal name is required.");
            return;
        }

        if (
            !formData.targetAmount ||
            targetAmount <= 0
        ) {

            setFormError(
                "Target amount must be greater than 0."
            );

            return;
        }

        if (currentAmount < 0) {

            setFormError(
                "Current amount cannot be negative."
            );

            return;
        }

        if (currentAmount > targetAmount) {

            setFormError(
                "Current amount cannot be greater than target amount."
            );

            return;
        }

        if (!formData.deadline) {

            setFormError(
                "Please select a deadline."
            );

            return;
        }


        try {

            setSaving(true);

            const payload = {
                name,
                targetAmount,
                currentAmount,
                deadline: formData.deadline
            };


            if (editingGoal) {

                // UPDATE

                const response = await api.put(
                    `/goals/${editingGoal.id}`,
                    payload
                );

                const updatedGoal =
                    response.data.goal;

                setGoals((previous) =>
                    previous.map((goal) =>
                        goal.id === editingGoal.id
                            ? updatedGoal
                            : goal
                    )
                );

            } else {

                // CREATE

                const response = await api.post(
                    "/goals",
                    payload
                );

                const newGoal =
                    response.data.goal;

                setGoals((previous) => [
                    newGoal,
                    ...previous
                ]);
            }

            closeModal();

        } catch (error) {

            console.error(
                "Save goal error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                "Unable to save goal."
            );

        } finally {

            setSaving(false);
        }
    };


    // ==========================================
    // DELETE GOAL
    // ==========================================

    const handleDelete = async (goalId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this goal?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await api.delete(
                `/goals/${goalId}`
            );

            setGoals((previous) =>
                previous.filter(
                    (goal) => goal.id !== goalId
                )
            );

        } catch (error) {

            console.error(
                "Delete goal error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to delete goal."
            );
        }
    };


    // ==========================================
    // CALCULATE PROGRESS
    // ==========================================

    const getProgress = (goal) => {

        const target =
            Number(goal.target_amount) || 0;

        const current =
            Number(goal.current_amount) || 0;

        if (target <= 0) {
            return 0;
        }

        return Math.min(
            Math.round((current / target) * 100),
            100
        );
    };


    // ==========================================
    // FORMAT MONEY
    // ==========================================

    const formatMoney = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(Number(amount) || 0);
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="goals-page">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="goals-header">

                <div>

                    <h1>
                        Goals
                    </h1>

                    <p>
                        Set financial goals and track your progress.
                    </p>

                </div>


                <button
                    className="add-goal-button"
                    onClick={openCreateModal}
                >
                    <span>+</span>
                    Add Goal
                </button>

            </div>


            {/* ==================================
                ERROR
            ================================== */}

            {error && (

                <div className="goals-error">
                    {error}
                </div>

            )}


            {/* ==================================
                LOADING
            ================================== */}

            {loading ? (

                <div className="goals-loading">
                    Loading goals...
                </div>

            ) : goals.length === 0 ? (

                /* ==================================
                   EMPTY STATE
                ================================== */

                <div className="goals-empty">

                    <div className="goal-empty-icon">
                        ◎
                    </div>

                    <h2>
                        No goals yet
                    </h2>

                    <p>
                        Create your first financial goal
                        and start tracking your progress.
                    </p>

                    <button
                        className="empty-add-goal-button"
                        onClick={openCreateModal}
                    >
                        Create Goal
                    </button>

                </div>

            ) : (

                /* ==================================
                   GOALS GRID
                ================================== */

                <div className="goals-grid">

                    {goals.map((goal) => {

                        const progress =
                            getProgress(goal);

                        const target =
                            Number(goal.target_amount) || 0;

                        const current =
                            Number(goal.current_amount) || 0;

                        const remaining =
                            Math.max(
                                target - current,
                                0
                            );

                        return (

                            <div
                                className="goal-card"
                                key={goal.id}
                            >

                                {/* CARD HEADER */}

                                <div className="goal-card-header">

                                    <div className="goal-icon">
                                        🎯
                                    </div>

                                    <div className="goal-actions">

                                        <button
                                            onClick={() =>
                                                openEditModal(goal)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(goal.id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>


                                {/* GOAL NAME */}

                                <h2>
                                    {goal.name}
                                </h2>


                                {/* AMOUNT */}

                                <div className="goal-amounts">

                                    <div>

                                        <span>
                                            Saved
                                        </span>

                                        <strong>
                                            {formatMoney(current)}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Target
                                        </span>

                                        <strong>
                                            {formatMoney(target)}
                                        </strong>

                                    </div>

                                </div>


                                {/* PROGRESS */}

                                <div className="goal-progress-section">

                                    <div className="goal-progress-header">

                                        <span>
                                            Progress
                                        </span>

                                        <strong>
                                            {progress}%
                                        </strong>

                                    </div>

                                    <div className="goal-progress-bar">

                                        <div
                                            className="goal-progress-fill"
                                            style={{
                                                width: `${progress}%`
                                            }}
                                        />

                                    </div>

                                </div>


                                {/* FOOTER */}

                                <div className="goal-card-footer">

                                    <div>

                                        <span>
                                            Remaining
                                        </span>

                                        <strong>
                                            {formatMoney(remaining)}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Deadline
                                        </span>

                                        <strong>
                                            {formatDate(
                                                goal.deadline
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        );
                    })}

                </div>

            )}


            {/* ==================================
                MODAL
            ================================== */}

            {showModal && (

                <div
                    className="goal-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="goal-modal">

                        {/* MODAL HEADER */}

                        <div className="goal-modal-header">

                            <div>

                                <h2>
                                    {editingGoal
                                        ? "Edit Goal"
                                        : "Add Goal"
                                    }
                                </h2>

                                <p>
                                    Set a target and track your savings.
                                </p>

                            </div>

                            <button
                                className="goal-close-button"
                                onClick={closeModal}
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="goal-form"
                            onSubmit={handleSubmit}
                        >

                            {/* NAME */}

                            <div className="goal-form-group">

                                <label>
                                    Goal Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. New Laptop"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>


                            {/* TARGET */}

                            <div className="goal-form-group">

                                <label>
                                    Target Amount
                                </label>

                                <div className="goal-money-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        name="targetAmount"
                                        placeholder="50000"
                                        min="1"
                                        step="0.01"
                                        value={
                                            formData.targetAmount
                                        }
                                        onChange={handleChange}
                                        disabled={saving}
                                    />

                                </div>

                            </div>


                            {/* CURRENT */}

                            <div className="goal-form-group">

                                <label>
                                    Current Savings
                                </label>

                                <div className="goal-money-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        name="currentAmount"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formData.currentAmount
                                        }
                                        onChange={handleChange}
                                        disabled={saving}
                                    />

                                </div>

                            </div>


                            {/* DEADLINE */}

                            <div className="goal-form-group">

                                <label>
                                    Deadline
                                </label>

                                <input
                                    type="date"
                                    name="deadline"
                                    value={
                                        formData.deadline
                                    }
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>


                            {/* ERROR */}

                            {formError && (

                                <div className="goal-form-error">
                                    {formError}
                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="goal-modal-actions">

                                <button
                                    type="button"
                                    className="goal-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="goal-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingGoal
                                            ? "Update Goal"
                                            : "Create Goal"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Goals;