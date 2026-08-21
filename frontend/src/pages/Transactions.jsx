import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Transactions.css";

function Transactions() {

    // ==========================================
    // STATE
    // ==========================================

    const [transactions, setTransactions] = useState([]);

    const [accounts, setAccounts] = useState([]);

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
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
    });


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {
        loadAccounts();
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
                    accountId: previous.accountId ||
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
            type: "expense",
            amount: "",
            category: "",
            description: "",
            date:
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
        // Validation
        // --------------------------------------

        if (!formData.accountId) {

            setFormError(
                "Please select an account."
            );

            return;
        }


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


        if (!formData.category.trim()) {

            setFormError(
                "Please enter a category."
            );

            return;
        }


        try {

            setSaving(true);


            // ==================================
            // CREATE
            // ==================================

            if (!editingTransaction) {

                const response =
                    await api.post(
                        "/transactions",
                        {
                            account_id:
                                formData.accountId,

                            type:
                                formData.type,

                            amount,

                            category:
                                formData.category.trim(),

                            description:
                                formData.description.trim(),

                            date:
                                formData.date
                        }
                    );

                console.log(
                    "Transaction created:",
                    response.data
                );

            }


            // ==================================
            // UPDATE
            // ==================================

            else {

                const response =
                    await api.put(
                        `/transactions/${editingTransaction.id}`,
                        {
                            accountId:
                                formData.accountId,
                        
                            type:
                                formData.type,

                            amount,

                            category:
                                formData.category.trim(),

                            description:
                                formData.description.trim(),

                            date:
                                formData.date
                        }
                    );              


                console.log(
                    "Transaction updated:",
                    response.data
                );
            }


            closeModal();


            /*
             * We don't have a GET /transactions
             * route in the routes you provided.
             *
             * So for now we don't attempt to
             * invent one.
             */

        } catch (error) {

            console.error(
                "Transaction save error:",
                error
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

    const openEditModal = async (transaction) => {

        /*
         * Your backend provides GET /transactions/:id.
         *
         * We use it so the edit form gets the
         * latest transaction data.
         */

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

            type:
                data.type ||
                "expense",

            amount:
                data.amount !== undefined
                    ? String(data.amount)
                    : "",

            category:
                data.category ||
                "",

            description:
                data.description ||
                "",

            date:
                data.date
                    ? String(data.date).split("T")[0]
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

    const handleDelete = async (transaction) => {

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


            setTransactions((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== transaction.id
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
                    disabled={accounts.length === 0}
                >
                    <span>
                        +
                    </span>

                    Add Transaction

                </button>

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
                TRANSACTIONS
            =================================== */}

            {accounts.length > 0 && (

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
                                        formData.type === "expense"
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
                                >
                                    Expense
                                </button>


                                <button
                                    type="button"
                                    className={
                                        formData.type === "income"
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
                                >

                                    <option value="">
                                        Select an account
                                    </option>

                                    {accounts.map(
                                        (account) => (

                                            <option
                                                key={account.id}
                                                value={account.id}
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
                                    />

                                </div>

                            </div>


                            {/* Category */}

                            <div className="transaction-form-group">

                                <label htmlFor="category">
                                    Category
                                </label>

                                <input
                                    id="category"
                                    name="category"
                                    type="text"
                                    placeholder="e.g. Food, Salary, Shopping"
                                    value={
                                        formData.category
                                    }
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>


                            {/* Date */}

                            <div className="transaction-form-group">

                                <label htmlFor="date">
                                    Date
                                </label>

                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={
                                        formData.date
                                    }
                                    onChange={handleChange}
                                    disabled={saving}
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