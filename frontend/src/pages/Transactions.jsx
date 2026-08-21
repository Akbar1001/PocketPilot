import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Transactions.css";

function Transactions() {
    // ==========================================
    // STATE
    // ==========================================

    const [transactions, setTransactions] = useState([]);

    const [accounts, setAccounts] = useState([]);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [saving, setSaving] = useState(false);

    const [formError, setFormError] = useState("");

    const [editingTransaction, setEditingTransaction] =
        useState(null);


    // ==========================================
    // FORM STATE
    // ==========================================

    const [formData, setFormData] = useState({
        accountId: "",
        categoryId: "",
        type: "expense",
        amount: "",
        description: "",
        transactionDate:
            new Date().toISOString().split("T")[0]
    });


    // ==========================================
    // LOAD DATA
    // ==========================================

   useEffect(() => {
    loadAccounts();
    loadTransactions();
    loadCategories();
}, []);

    // ==========================================
    // LOAD ACCOUNTS
    // ==========================================

    const loadAccounts = async () => {
        try {
            const response = await api.get("/accounts");

            const loadedAccounts =
                response.data.accounts || [];

            setAccounts(loadedAccounts);

            if (loadedAccounts.length > 0) {
                setFormData((previous) => ({
                    ...previous,
                    accountId:
                        previous.accountId ||
                        loadedAccounts[0].id
                }));
            }

        } catch (error) {
            console.error(
                "Load accounts error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load accounts."
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // LOAD TRANSACTIONS
    // ==========================================

    const loadTransactions = async () => {
        try {

            const response = await api.get(
                "/transactions"
            );

            console.log(
                "Transactions:",
                response.data
            );

            setTransactions(
                response.data.transactions || []
            );

        } catch (error) {

            console.error(
                "Load transactions error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load transactions."
            );
        }   
    };


    // ==========================================
    // LOAD CATEGORIES
    // ==========================================

    const loadCategories = async () => {
        try {
            const response = await api.get("/categories");

            const loadedCategories =
                response.data.categories || [];

            setCategories(loadedCategories);

            if (loadedCategories.length > 0) {
                setFormData((previous) => ({
                    ...previous,
                    categoryId:
                        previous.categoryId ||
                        loadedCategories[0].id
                }));
            }

        } catch (error) {
            console.error(
                "Load categories error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load categories."
            );
        }
    };


    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

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
        setEditingTransaction(null);

        setFormData({
            accountId:
                accounts.length > 0
                    ? accounts[0].id
                    : "",

            categoryId:
                categories.length > 0
                    ? categories[0].id
                    : "",

            type: "expense",

            amount: "",

            description: "",

            transactionDate:
                new Date()
                    .toISOString()
                    .split("T")[0]
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

        setEditingTransaction(null);

        setFormError("");
    };


    // ==========================================
    // SUBMIT TRANSACTION
    // ==========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormError("");


        // --------------------------------------
        // Account validation
        // --------------------------------------

        if (!formData.accountId) {
            setFormError(
                "Please select an account."
            );

            return;
        }


        // --------------------------------------
        // Category validation
        // --------------------------------------

        if (!formData.categoryId) {
            setFormError(
                "Please select a category."
            );

            return;
        }


        // --------------------------------------
        // Amount validation
        // --------------------------------------

        if (!formData.amount) {
            setFormError(
                "Please enter an amount."
            );

            return;
        }


        const amount = Number(
            formData.amount
        );


        if (
            Number.isNaN(amount) ||
            amount <= 0
        ) {
            setFormError(
                "Amount must be greater than zero."
            );

            return;
        }


        // --------------------------------------
        // Date validation
        // --------------------------------------

        if (!formData.transactionDate) {
            setFormError(
                "Please select a date."
            );

            return;
        }


        try {
            setSaving(true);


            // ==================================
            // REQUEST BODY
            // ==================================

            const transactionData = {
                accountId:
                    formData.accountId,

                categoryId:
                    formData.categoryId,

                type:
                    formData.type,

                amount,

                description:
                    formData.description.trim(),

                transactionDate:
                    formData.transactionDate
            };


            console.log(
                "Transaction being sent:",
                transactionData
            );


            // ==================================
            // CREATE
            // ==================================

            if (!editingTransaction) {

                const response =
                    await api.post(
                        "/transactions",
                        transactionData
                    );


                console.log(
                    "Transaction created:",
                    response.data
                );


                // Add newly created transaction
                // to local state.

                if (response.data.transaction) {
                    setTransactions(
                        (previous) => [
                            response.data.transaction,
                            ...previous
                        ]
                    );
                }

            }


            // ==================================
            // UPDATE
            // ==================================

            else {

                const response =
                    await api.put(
                        `/transactions/${editingTransaction.id}`,
                        transactionData
                    );


                console.log(
                    "Transaction updated:",
                    response.data
                );


                if (response.data.transaction) {

                    setTransactions(
                        (previous) =>
                            previous.map(
                                (item) =>
                                    item.id ===
                                    editingTransaction.id
                                        ? response.data.transaction
                                        : item
                            )
                    );
                }
            }


            closeModal();


        } catch (error) {

            console.error(
                "Transaction save error:",
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            setFormError(
                error.response?.data?.message ||
                "Unable to save transaction."
            );


        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // GET SINGLE TRANSACTION
    // ==========================================

    const getTransaction = async (id) => {
        try {

            const response =
                await api.get(
                    `/transactions/${id}`
                );

            return response.data.transaction;

        } catch (error) {

            console.error(
                "Get transaction error:",
                error
            );

            return null;
        }
    };


    // ==========================================
    // EDIT TRANSACTION
    // ==========================================

    const openEditModal = async (
        transaction
    ) => {

        const latest =
            await getTransaction(
                transaction.id
            );


        const data =
            latest || transaction;


        setEditingTransaction(data);


        setFormData({

            accountId:
                data.account_id ||
                data.accountId ||
                "",


            categoryId:
                data.category_id ||
                data.categoryId ||
                "",


            type:
                data.type ||
                "expense",


            amount:
                data.amount !== undefined
                    ? String(data.amount)
                    : "",


            description:
                data.description ||
                "",


            transactionDate:
                data.transaction_date
                    ? String(
                        data.transaction_date
                    ).split("T")[0]
                    : new Date()
                        .toISOString()
                        .split("T")[0]
        });


        setFormError("");

        setShowModal(true);
    };


    // ==========================================
    // DELETE TRANSACTION
    // ==========================================

    const handleDelete = async (
        transaction
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this transaction?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `/transactions/${transaction.id}`
            );


            setTransactions(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item.id !==
                            transaction.id
                    )
            );


        } catch (error) {

            console.error(
                "Delete transaction error:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Unable to delete transaction."
            );
        }
    };


    // ==========================================
    // FORMAT MONEY
    // ==========================================

    const formatMoney = (amount) => {
        return Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );
    };


    // ==========================================
    // TRANSACTION TYPE
    // ==========================================

    const getTypeLabel = (type) => {

        if (type === "income") {
            return "Income";
        }

        return "Expense";
    };


    // ==========================================
    // GET ACCOUNT NAME
    // ==========================================

    const getAccountName = (
        transaction
    ) => {

        const account = accounts.find(
            (item) =>
                String(item.id) ===
                String(
                    transaction.account_id ||
                    transaction.accountId
                )
        );

        return (
            transaction.account_name ||
            account?.name ||
            "Unknown Account"
        );
    };


    // ==========================================
    // GET CATEGORY NAME
    // ==========================================

    const getCategoryName = (
        transaction
    ) => {

        const category = categories.find(
            (item) =>
                String(item.id) ===
                String(
                    transaction.category_id ||
                    transaction.categoryId
                )
        );

        return (
            transaction.category_name ||
            category?.name ||
            "Unknown Category"
        );
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const cleanDate =
            String(date).split("T")[0];

        const parts =
            cleanDate.split("-");

        if (parts.length !== 3) {
            return cleanDate;
        }

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="transactions-page">

                <div className="transactions-loading">
                    Loading transactions...
                </div>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="transactions-page">


            {/* ==================================
                HEADER
            =================================== */}

            <div className="transactions-header">

                <div>

                    <h1>
                        Transactions
                    </h1>

                    <p>
                        Track your income and expenses.
                    </p>

                </div>


                <button
                    className="add-transaction-button"
                    onClick={openCreateModal}
                    disabled={
                        accounts.length === 0 ||
                        categories.length === 0
                    }
                >

                    <span>
                        +
                    </span>

                    Add Transaction

                </button>

            </div>

            {/* ==================================
    TRANSACTION SUMMARY
=================================== */}

<div className="transaction-summary">

    {/* Total Income */}

    <div className="summary-card income-card">

        <div className="summary-card-content">

            <p>
                Total Income
            </p>

            <h2>
                ₹{formatMoney(totalIncome)}
            </h2>

        </div>

        <div className="summary-icon">
            ↗
        </div>

    </div>


    {/* Total Expense */}

    <div className="summary-card expense-card">

        <div className="summary-card-content">

            <p>
                Total Expense
            </p>

            <h2>
                ₹{formatMoney(totalExpense)}
            </h2>

        </div>

        <div className="summary-icon">
            ↘
        </div>

    </div>


    {/* Net Balance */}

    <div className="summary-card balance-card">

        <div className="summary-card-content">

            <p>
                Net Balance
            </p>

            <h2>
                ₹{formatMoney(netBalance)}
            </h2>

        </div>

        <div className="summary-icon">
            ₹
        </div>

    </div>

</div>


            {/* ==================================
                ERROR
            =================================== */}

            {error && (

                <div className="transactions-error">
                    {error}
                </div>

            )}


            {/* ==================================
                NO ACCOUNTS
            =================================== */}

            {accounts.length === 0 && (

                <div className="transactions-empty">

                    <div className="empty-icon">
                        💳
                    </div>

                    <h2>
                        Add an account first
                    </h2>

                    <p>
                        You need at least one account
                        before creating a transaction.
                    </p>

                </div>

            )}


            {/* ==================================
                NO CATEGORIES
            =================================== */}

            {accounts.length > 0 &&
                categories.length === 0 && (

                    <div className="transactions-empty">

                        <div className="empty-icon">
                            🏷️
                        </div>

                        <h2>
                            No categories available
                        </h2>

                        <p>
                            You need at least one
                            category before creating
                            a transaction.
                        </p>

                    </div>

                )}


            {/* ==================================
                TRANSACTION LIST
            =================================== */}

            {accounts.length > 0 &&
                categories.length > 0 &&
                transactions.length === 0 && (

                    <div className="transactions-empty">

                        <div className="empty-icon">
                            💰
                        </div>

                        <h2>
                            No transactions yet
                        </h2>

                        <p>
                            Start tracking your income
                            and expenses by adding your
                            first transaction.
                        </p>


                        <button
                            className="empty-add-button"
                            onClick={openCreateModal}
                        >
                            Add Your First Transaction
                        </button>

                    </div>

                )}


            {/* ==================================
                TRANSACTION CARDS
            =================================== */}

            {transactions.length > 0 && (

                <div className="transaction-list">

                    {transactions.map(
                        (transaction) => (

                            <div
                                className="transaction-card"
                                key={transaction.id}
                            >

                                <div className="transaction-card-left">

                                    <div
                                        className={
                                            transaction.type ===
                                            "income"
                                                ? "transaction-icon income"
                                                : "transaction-icon expense"
                                        }
                                    >
                                        {transaction.type ===
                                        "income"
                                            ? "↗"
                                            : "↘"}
                                    </div>


                                    <div>

                                        <h3>
                                            {getCategoryName(
                                                transaction
                                            )}
                                        </h3>

                                        <p>
                                            {
                                                transaction.description ||
                                                "No description"
                                            }
                                        </p>

                                        <small>
                                            {getAccountName(
                                                transaction
                                            )}
                                            {" • "}
                                            {formatDate(
                                                transaction.transaction_date ||
                                                transaction.transactionDate
                                            )}
                                        </small>

                                    </div>

                                </div>


                                <div className="transaction-card-right">

                                    <div
                                        className={
                                            transaction.type ===
                                            "income"
                                                ? "transaction-amount income"
                                                : "transaction-amount expense"
                                        }
                                    >
                                        {transaction.type ===
                                        "income"
                                            ? "+"
                                            : "-"}
                                        ₹
                                        {formatMoney(
                                            transaction.amount
                                        )}
                                    </div>


                                    <div className="transaction-type">

                                        {getTypeLabel(
                                            transaction.type
                                        )}

                                    </div>


                                    <div className="transaction-actions">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditModal(
                                                    transaction
                                                )
                                            }
                                        >
                                            Edit
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    transaction
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}


            {/* ==================================
                ADD / EDIT MODAL
            =================================== */}

            {showModal && (

                <div
                    className="transaction-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div
                        className="transaction-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* Modal header */}

                        <div className="transaction-modal-header">

                            <div>

                                <h2>

                                    {editingTransaction
                                        ? "Edit Transaction"
                                        : "Add Transaction"}

                                </h2>


                                <p>

                                    {editingTransaction
                                        ? "Update your transaction details."
                                        : "Record an income or expense."}

                                </p>

                            </div>


                            <button
                                className="transaction-close-button"
                                onClick={closeModal}
                                disabled={saving}
                                type="button"
                            >
                                ×
                            </button>

                        </div>


                        {/* ==================================
                            FORM
                        =================================== */}

                        <form
                            className="transaction-form"
                            onSubmit={handleSubmit}
                        >


                            {/* Transaction Type */}

                            <div className="transaction-type-selector">

                                <button
                                    type="button"
                                    className={
                                        formData.type ===
                                        "expense"
                                            ? "type-button active expense"
                                            : "type-button"
                                    }
                                    onClick={() =>
                                        setFormData(
                                            (previous) => ({
                                                ...previous,
                                                type: "expense"
                                            })
                                        )
                                    }
                                    disabled={saving}
                                >
                                    Expense
                                </button>


                                <button
                                    type="button"
                                    className={
                                        formData.type ===
                                        "income"
                                            ? "type-button active income"
                                            : "type-button"
                                    }
                                    onClick={() =>
                                        setFormData(
                                            (previous) => ({
                                                ...previous,
                                                type: "income"
                                            })
                                        )
                                    }
                                    disabled={saving}
                                >
                                    Income
                                </button>

                            </div>


                            {/* Account */}

                            <div className="transaction-form-group">

                                <label htmlFor="accountId">
                                    Account
                                </label>


                                <select
                                    id="accountId"
                                    name="accountId"
                                    value={
                                        formData.accountId
                                    }
                                    onChange={handleChange}
                                    disabled={saving}
                                    required
                                >

                                    <option value="">
                                        Select an account
                                    </option>


                                    {accounts.map(
                                        (account) => (

                                            <option
                                                key={
                                                    account.id
                                                }
                                                value={
                                                    account.id
                                                }
                                            >
                                                {account.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* Amount */}

                            <div className="transaction-form-group">

                                <label htmlFor="amount">
                                    Amount
                                </label>


                                <div className="transaction-amount-input">

                                    <span>
                                        ₹
                                    </span>


                                    <input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={
                                            formData.amount
                                        }
                                        onChange={handleChange}
                                        disabled={saving}
                                        required
                                    />

                                </div>

                            </div>


                            {/* Category */}

                            <div className="transaction-form-group">

                                <label htmlFor="categoryId">
                                    Category
                                </label>


                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    value={
                                        formData.categoryId
                                    }
                                    onChange={handleChange}
                                    disabled={saving}
                                    required
                                >

                                    <option value="">
                                        Select a category
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


                            {/* Date */}

                            <div className="transaction-form-group">

                                <label htmlFor="transactionDate">
                                    Date
                                </label>


                                <input
                                    id="transactionDate"
                                    name="transactionDate"
                                    type="date"
                                    value={
                                        formData.transactionDate
                                    }
                                    onChange={handleChange}
                                    disabled={saving}
                                    required
                                />

                            </div>


                            {/* Description */}

                            <div className="transaction-form-group">

                                <label htmlFor="description">
                                    Description
                                </label>


                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    placeholder="Add a note..."
                                    value={
                                        formData.description
                                    }
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>


                            {/* Error */}

                            {formError && (

                                <div className="transaction-form-error">
                                    {formError}
                                </div>

                            )}


                            {/* Actions */}

                            <div className="transaction-modal-actions">

                                <button
                                    type="button"
                                    className="transaction-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="transaction-save-button"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingTransaction
                                        ? "Save Changes"
                                        : "Add Transaction"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Transactions;