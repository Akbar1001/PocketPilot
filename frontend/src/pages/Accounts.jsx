import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Accounts.css";

const Accounts = () => {
    // ==========================================
    // ACCOUNTS STATE
    // ==========================================

    const [accounts, setAccounts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // MODAL STATE
    // ==========================================

    const [showModal, setShowModal] = useState(false);

    const [creating, setCreating] = useState(false);

    const [formError, setFormError] = useState("");


    // ==========================================
    // EDIT STATE
    // ==========================================

    const [editingAccount, setEditingAccount] = useState(null);


    // ==========================================
    // DELETE STATE
    // ==========================================

    const [deletingAccount, setDeletingAccount] = useState(null);

    const [deleting, setDeleting] = useState(false);


    // ==========================================
    // FORM STATE
    // ==========================================

    const [formData, setFormData] = useState({
        name: "",
        type: "bank",
        initialBalance: ""
    });


    // ==========================================
    // FETCH ACCOUNTS
    // ==========================================

    useEffect(() => {
        fetchAccounts();
    }, []);


    const fetchAccounts = async () => {
        try {

            setLoading(true);

            setError("");

            const response = await api.get("/accounts");

            console.log(
                "Accounts:",
                response.data
            );

            setAccounts(
                response.data.accounts || []
            );

        } catch (error) {

            console.error(
                "Accounts error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load your accounts."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // HANDLE INPUT CHANGE
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

        if (formError) {
            setFormError("");
        }
    };


    // ==========================================
    // OPEN CREATE MODAL
    // ==========================================

    const openCreateModal = () => {

        setEditingAccount(null);

        setFormData({
            name: "",
            type: "bank",
            initialBalance: ""
        });

        setFormError("");

        setShowModal(true);
    };


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (account) => {

        console.log(
            "Editing account:",
            account
        );

        setEditingAccount(account);

        setFormData({
            name: account.name || "",
            type: account.type || "bank",

            // Load existing balance into edit form
            initialBalance:
                account.balance !== null &&
                account.balance !== undefined
                    ? String(account.balance)
                    : "0"
        });

        setFormError("");

        setShowModal(true);
    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {

        if (creating) {
            return;
        }

        setShowModal(false);

        setEditingAccount(null);

        setFormError("");

        setFormData({
            name: "",
            type: "bank",
            initialBalance: ""
        });
    };


    // ==========================================
    // CREATE / UPDATE ACCOUNT
    // ==========================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        // ======================================
        // VALIDATION
        // ======================================

        if (!formData.name.trim()) {

            setFormError(
                "Please enter an account name."
            );

            return;
        }


        // Convert balance into number

        const balanceValue =
            formData.initialBalance === ""
                ? 0
                : Number(formData.initialBalance);


        // Check valid number

        if (
            Number.isNaN(balanceValue) ||
            balanceValue < 0
        ) {

            setFormError(
                "Please enter a valid balance."
            );

            return;
        }


        try {

            setCreating(true);

            setFormError("");


            // ==================================
            // EDIT ACCOUNT
            // ==================================

            if (editingAccount) {

                const response = await api.put(
                    `/accounts/${editingAccount.id}`,
                    {
                        name: formData.name.trim(),

                        type: formData.type,

                        balance: balanceValue
                    }
                );

                console.log(
                    "Account updated:",
                    response.data
                );

            }


            // ==================================
            // CREATE ACCOUNT
            // ==================================

            else {

                const response = await api.post(
                    "/accounts",
                    {
                        name: formData.name.trim(),

                        type: formData.type,

                        initialBalance: balanceValue
                    }
                );

                console.log(
                    "Account created:",
                    response.data
                );
            }


            // ==================================
            // CLOSE MODAL
            // ==================================

            setShowModal(false);

            setEditingAccount(null);


            // ==================================
            // RESET FORM
            // ==================================

            setFormData({
                name: "",
                type: "bank",
                initialBalance: ""
            });


            // ==================================
            // REFRESH ACCOUNTS
            // ==================================

            await fetchAccounts();


        } catch (error) {

            console.error(
                "Account save error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                "Unable to save account."
            );

        } finally {

            setCreating(false);
        }
    };


    // ==========================================
    // OPEN DELETE CONFIRMATION
    // ==========================================

    const openDeleteModal = (account) => {

        setDeletingAccount(account);
    };


    // ==========================================
    // CLOSE DELETE CONFIRMATION
    // ==========================================

    const closeDeleteModal = () => {

        if (deleting) {
            return;
        }

        setDeletingAccount(null);
    };


    // ==========================================
    // DELETE ACCOUNT
    // ==========================================

    const handleDelete = async () => {

        if (!deletingAccount) {
            return;
        }


        try {

            setDeleting(true);


            await api.delete(
                `/accounts/${deletingAccount.id}`
            );


            console.log(
                "Account deleted:",
                deletingAccount.id
            );


            // Close confirmation

            setDeletingAccount(null);


            // Refresh accounts

            await fetchAccounts();


        } catch (error) {

            console.error(
                "Delete account error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete account."
            );

        } finally {

            setDeleting(false);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="accounts-page">

                <div className="accounts-loading">
                    Loading accounts...
                </div>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="accounts-page">


            {/* =================================
                HEADER
            ================================== */}

            <div className="accounts-header">

                <div>

                    <h1>
                        Accounts
                    </h1>

                    <p>
                        Manage your bank accounts,
                        cash and wallets.
                    </p>

                </div>


                <button
                    className="add-account-button"
                    onClick={openCreateModal}
                >

                    <span>
                        +
                    </span>

                    Add Account

                </button>

            </div>


            {/* =================================
                ERROR
            ================================== */}

            {error && (

                <div className="accounts-error">

                    {error}

                </div>

            )}


            {/* =================================
                SUMMARY
            ================================== */}

            <div className="accounts-summary">


                <div>

                    <span>
                        Total Accounts
                    </span>

                    <strong>
                        {accounts.length}
                    </strong>

                </div>


                <div>

                    <span>
                        Total Balance
                    </span>

                    <strong>

                        ₹
                        {accounts
                            .reduce(
                                (
                                    total,
                                    account
                                ) =>
                                    total +
                                    Number(
                                        account.balance || 0
                                    ),
                                0
                            )
                            .toLocaleString(
                                "en-IN"
                            )}

                    </strong>

                </div>


            </div>


            {/* =================================
                ACCOUNT LIST
            ================================== */}

            {accounts.length === 0 ? (

                <div className="empty-accounts">

                    <div className="empty-account-icon">
                        +
                    </div>

                    <h2>
                        No accounts yet
                    </h2>

                    <p>
                        Add your first account
                        to start tracking your money.
                    </p>


                    <button
                        className="add-account-empty-button"
                        onClick={openCreateModal}
                    >
                        Add Your First Account
                    </button>

                </div>

            ) : (

                <div className="accounts-grid">

                    {accounts.map(
                        (account) => (

                            <div
                                className="account-card"
                                key={account.id}
                            >


                                {/* Account top */}

                                <div className="account-card-top">


                                    <div className="account-icon">

                                        {account.type ===
                                        "cash"
                                            ? "💵"
                                            : account.type ===
                                              "credit_card"
                                            ? "💳"
                                            : account.type ===
                                              "wallet"
                                            ? "👛"
                                            : "🏦"}

                                    </div>


                                    <div className="account-actions">

                                        <button
                                            onClick={() =>
                                                openEditModal(
                                                    account
                                                )
                                            }
                                        >
                                            Edit
                                        </button>


                                        <button
                                            onClick={() =>
                                                openDeleteModal(
                                                    account
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>


                                {/* Account information */}

                                <div className="account-information">

                                    <h2>

                                        {
                                            account.name ||
                                            "Unnamed Account"
                                        }

                                    </h2>


                                    <p>

                                        {
                                            account.type ||
                                            "Account"
                                        }

                                    </p>

                                </div>


                                {/* Balance */}

                                <div className="account-balance">

                                    <span>
                                        Current Balance
                                    </span>


                                    <strong>

                                        ₹
                                        {Number(
                                            account.balance || 0
                                        ).toLocaleString(
                                            "en-IN"
                                        )}

                                    </strong>

                                </div>


                            </div>

                        )
                    )}

                </div>

            )}


            {/* =================================
                CREATE / EDIT MODAL
            ================================== */}

            {showModal && (

                <div
                    className="modal-overlay"
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
                        className="account-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* Modal header */}

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {editingAccount
                                        ? "Edit Account"
                                        : "Add Account"}

                                </h2>


                                <p>

                                    {editingAccount
                                        ? "Update your account details."
                                        : "Add a bank account, wallet or cash account."}

                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeModal}
                                disabled={creating}
                            >
                                ×
                            </button>

                        </div>


                        {/* Form */}

                        <form
                            className="account-form"
                            onSubmit={handleSubmit}
                        >


                            {/* Account Name */}

                            <div className="form-group">

                                <label htmlFor="name">
                                    Account Name
                                </label>


                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="e.g. HDFC Bank"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={creating}
                                />

                            </div>


                            {/* Account Type */}

                            <div className="form-group">

                                <label htmlFor="type">
                                    Account Type
                                </label>


                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    disabled={creating}
                                >

                                    <option value="bank">
                                        Bank Account
                                    </option>

                                    <option value="cash">
                                        Cash
                                    </option>

                                    <option value="credit_card">
                                        Credit Card
                                    </option>

                                    <option value="wallet">
                                        Digital Wallet
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* =================================
                                BALANCE
                            ================================== */}

                            <div className="form-group">

                                <label htmlFor="initialBalance">

                                    {editingAccount
                                        ? "Current Balance"
                                        : "Initial Balance"}

                                </label>


                                <div className="balance-input-wrapper">

                                    <span className="currency-symbol">
                                        ₹
                                    </span>


                                    <input
                                        id="initialBalance"
                                        name="initialBalance"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                        value={
                                            formData.initialBalance
                                        }
                                        onChange={handleChange}
                                        disabled={creating}
                                    />

                                </div>


                                {!editingAccount && (

                                    <small className="form-help">
                                        Enter the amount currently
                                        available in this account.
                                    </small>

                                )}

                                {editingAccount && (

                                    <small className="form-help">
                                        Update the current balance
                                        of this account.
                                    </small>

                                )}

                            </div>


                            {/* Error */}

                            {formError && (

                                <div className="form-error">

                                    {formError}

                                </div>

                            )}


                            {/* Buttons */}

                            <div className="modal-actions">


                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeModal}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={creating}
                                >

                                    {creating
                                        ? "Saving..."
                                        : editingAccount
                                        ? "Save Changes"
                                        : "Create Account"}

                                </button>

                            </div>


                        </form>


                    </div>


                </div>

            )}


            {/* =================================
                DELETE CONFIRMATION
            ================================== */}

            {deletingAccount && (

                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeDeleteModal();

                        }

                    }}
                >


                    <div
                        className="delete-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >


                        <div className="delete-icon">
                            !
                        </div>


                        <h2>
                            Delete Account?
                        </h2>


                        <p>

                            Are you sure you want to
                            delete{" "}

                            <strong>
                                {deletingAccount.name}
                            </strong>
                            ?

                            <br />

                            This action cannot be undone.

                        </p>


                        <div className="modal-actions">


                            <button
                                className="cancel-button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                            >
                                Cancel
                            </button>


                            <button
                                className="delete-confirm-button"
                                onClick={handleDelete}
                                disabled={deleting}
                            >

                                {deleting
                                    ? "Deleting..."
                                    : "Delete Account"}

                            </button>


                        </div>


                    </div>


                </div>

            )}


        </div>

    );
};


export default Accounts;