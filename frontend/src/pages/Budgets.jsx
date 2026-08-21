import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./Budgets.css";

function Budgets() {

    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const [formData, setFormData] = useState({
        category_id: "",
        amount: "",
        period: "monthly",
        start_date: new Date().toISOString().split("T")[0]
    });


    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        loadData();
    }, []);


    const loadData = async () => {

        setLoading(true);
        setError("");

        try {

            const [budgetsResponse, categoriesResponse] =
                await Promise.all([
                    api.get("/budgets"),
                    api.get("/categories")
                ]);


            setBudgets(
                budgetsResponse.data?.budgets || []
            );


            const allCategories =
                categoriesResponse.data?.categories || [];


            // Budgets only use expense categories

            setCategories(
                allCategories.filter(
                    (category) => category.type === "expense"
                )
            );


        } catch (err) {

            console.error("Load budgets error:", err);

            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else {

                setError(
                    err.response?.data?.message ||
                    "Unable to load budgets."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // SUMMARY
    // =====================================================

    const totalBudget = useMemo(() => {

        return budgets.reduce(
            (sum, budget) =>
                sum + Number(budget.amount || 0),
            0
        );

    }, [budgets]);


    // =====================================================
    // FORM HANDLING
    // =====================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setFormError("");
    };


    const openAddModal = () => {

        setEditingBudget(null);

        setFormData({
            category_id:
                categories.length > 0
                    ? String(categories[0].id)
                    : "",
            amount: "",
            period: "monthly",
            start_date:
                new Date()
                    .toISOString()
                    .split("T")[0]
        });

        setFormError("");
        setShowModal(true);
    };


    const openEditModal = (budget) => {

        setEditingBudget(budget);

        setFormData({
            category_id: String(budget.category_id),
            amount: budget.amount,
            period: budget.period,
            start_date:
                String(budget.start_date).split("T")[0]
        });

        setFormError("");
        setShowModal(true);
    };


    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingBudget(null);
        setFormError("");
    };


    // =====================================================
    // SAVE BUDGET
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setFormError("");

        if (!formData.category_id) {

            setFormError(
                "Please select a category."
            );

            return;
        }


        if (
            !formData.amount ||
            Number(formData.amount) <= 0
        ) {

            setFormError(
                "Budget amount must be greater than 0."
            );

            return;
        }


        if (!formData.start_date) {

            setFormError(
                "Please select a start date."
            );

            return;
        }


        setSaving(true);

        try {

            const payload = {
                category_id: Number(
                    formData.category_id
                ),

                amount: Number(
                    formData.amount
                ),

                period: formData.period,

                start_date:
                    formData.start_date
            };


            let response;


            if (editingBudget) {

                response = await api.put(
                    `/budgets/${editingBudget.id}`,
                    payload
                );

            } else {

                response = await api.post(
                    "/budgets",
                    payload
                );
            }


            const savedBudget =
                response.data?.budget;


            if (editingBudget) {

                setBudgets((previous) =>
                    previous.map((budget) =>
                        budget.id === editingBudget.id
                            ? savedBudget
                            : budget
                    )
                );

            } else {

                setBudgets((previous) => [
                    savedBudget,
                    ...previous
                ]);
            }


            closeModal();

        } catch (err) {

            console.error(
                "Save budget error:",
                err
            );

            setFormError(
                err.response?.data?.message ||
                "Unable to save budget."
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // DELETE BUDGET
    // =====================================================

    const handleDelete = async (budget) => {

        const confirmed = window.confirm(
            `Delete the ${budget.category_name} budget?`
        );

        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `/budgets/${budget.id}`
            );


            setBudgets((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== budget.id
                )
            );


        } catch (err) {

            console.error(
                "Delete budget error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to delete budget."
            );
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="budgets-page">

                <div className="budgets-loading">
                    Loading budgets...
                </div>

            </div>
        );
    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="budgets-page">

            {/* HEADER */}

            <div className="budgets-header">

                <div>

                    <h1>
                        Budgets
                    </h1>

                    <p>
                        Set spending limits and stay in control of your money.
                    </p>

                </div>


                <button
                    className="add-budget-button"
                    onClick={openAddModal}
                    disabled={categories.length === 0}
                >

                    <span>
                        +
                    </span>

                    Add Budget

                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div className="budgets-error">
                    {error}
                </div>

            )}


            {/* SUMMARY */}

            <div className="budget-summary-grid">

                <div className="budget-summary-card">

                    <div className="budget-summary-icon">
                        ₹
                    </div>

                    <div>

                        <span>
                            Total Budget
                        </span>

                        <strong>
                            ₹{totalBudget.toLocaleString("en-IN")}
                        </strong>

                    </div>

                </div>


                <div className="budget-summary-card">

                    <div className="budget-summary-icon">
                        #
                    </div>

                    <div>

                        <span>
                            Active Budgets
                        </span>

                        <strong>
                            {budgets.length}
                        </strong>

                    </div>

                </div>

            </div>


            {/* NO CATEGORIES */}

            {categories.length === 0 && (

                <div className="budgets-empty">

                    <div className="budget-empty-icon">
                        📁
                    </div>

                    <h2>
                        No expense categories
                    </h2>

                    <p>
                        Create an expense category first before setting a budget.
                    </p>

                </div>

            )}


            {/* NO BUDGETS */}

            {categories.length > 0 &&
                budgets.length === 0 && (

                    <div className="budgets-empty">

                        <div className="budget-empty-icon">
                            💰
                        </div>

                        <h2>
                            No budgets yet
                        </h2>

                        <p>
                            Create your first budget to start tracking your spending limits.
                        </p>

                        <button
                            className="empty-budget-button"
                            onClick={openAddModal}
                        >
                            Create Budget
                        </button>

                    </div>
                )}


            {/* BUDGET LIST */}

            {budgets.length > 0 && (

                <div className="budgets-list">

                    {budgets.map((budget) => (

                        <div
                            className="budget-card"
                            key={budget.id}
                        >

                            <div className="budget-card-top">

                                <div>

                                    <h3>
                                        {budget.category_name}
                                    </h3>

                                    <span className="budget-period">
                                        {budget.period === "monthly"
                                            ? "Monthly"
                                            : "Weekly"
                                        }
                                    </span>

                                </div>


                                <div className="budget-card-actions">

                                    <button
                                        onClick={() =>
                                            openEditModal(budget)
                                        }
                                        className="budget-edit-button"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(budget)
                                        }
                                        className="budget-delete-button"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>


                            <div className="budget-card-amount">

                                <span>
                                    Spending limit
                                </span>

                                <strong>
                                    ₹{Number(
                                        budget.amount
                                    ).toLocaleString("en-IN")}
                                </strong>

                            </div>


                            <div className="budget-card-footer">

                                <span>
                                    Starts{" "}
                                    {new Date(
                                        budget.start_date
                                    ).toLocaleDateString(
                                        "en-IN"
                                    )}
                                </span>

                            </div>

                        </div>

                    ))}

                </div>

            )}


            {/* MODAL */}

            {showModal && (

                <div
                    className="budget-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="budget-modal">

                        {/* MODAL HEADER */}

                        <div className="budget-modal-header">

                            <div>

                                <h2>
                                    {editingBudget
                                        ? "Edit Budget"
                                        : "Create Budget"
                                    }
                                </h2>

                                <p>
                                    Set a spending limit for an expense category.
                                </p>

                            </div>


                            <button
                                className="budget-close-button"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="budget-form"
                            onSubmit={handleSubmit}
                        >

                            {/* CATEGORY */}

                            <div className="budget-form-group">

                                <label htmlFor="category_id">
                                    Expense Category
                                </label>

                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={
                                        formData.category_id
                                    }
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map(
                                        (category) => (

                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {category.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* AMOUNT */}

                            <div className="budget-form-group">

                                <label htmlFor="amount">
                                    Budget Amount
                                </label>

                                <div className="budget-amount-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="10000"
                                        value={
                                            formData.amount
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* PERIOD */}

                            <div className="budget-form-group">

                                <label>
                                    Budget Period
                                </label>

                                <div className="budget-period-selector">

                                    <button
                                        type="button"
                                        className={
                                            formData.period ===
                                            "monthly"
                                                ? "period-button active"
                                                : "period-button"
                                        }
                                        onClick={() =>
                                            setFormData(
                                                (previous) => ({
                                                    ...previous,
                                                    period: "monthly"
                                                })
                                            )
                                        }
                                    >
                                        Monthly
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            formData.period ===
                                            "weekly"
                                                ? "period-button active"
                                                : "period-button"
                                        }
                                        onClick={() =>
                                            setFormData(
                                                (previous) => ({
                                                    ...previous,
                                                    period: "weekly"
                                                })
                                            )
                                        }
                                    >
                                        Weekly
                                    </button>

                                </div>

                            </div>


                            {/* START DATE */}

                            <div className="budget-form-group">

                                <label htmlFor="start_date">
                                    Start Date
                                </label>

                                <input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    value={
                                        formData.start_date
                                    }
                                    onChange={handleChange}
                                />

                            </div>


                            {/* FORM ERROR */}

                            {formError && (

                                <div className="budget-form-error">
                                    {formError}
                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="budget-modal-actions">

                                <button
                                    type="button"
                                    className="budget-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="budget-save-button"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingBudget
                                            ? "Update Budget"
                                            : "Create Budget"
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


export default Budgets;