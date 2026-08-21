import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Categories.css";

function Categories() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        type: "expense"
    });

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/categories");

            setCategories(response.data?.categories || []);
        } catch (err) {
            console.error("Load categories error:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please login again.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load categories."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const expenseCategories = useMemo(
        () => categories.filter((category) => category.type === "expense"),
        [categories]
    );

    const incomeCategories = useMemo(
        () => categories.filter((category) => category.type === "income"),
        [categories]
    );

    const openAddModal = (type = "expense") => {
        setEditingCategory(null);
        setFormData({
            name: "",
            type
        });
        setFormError("");
        setShowModal(true);
    };

    const openEditModal = (category) => {
        // Categories with user_id === null are system/default categories.
        if (category.user_id === null) {
            return;
        }

        setEditingCategory(category);
        setFormData({
            name: category.name,
            type: category.type
        });
        setFormError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingCategory(null);
        setFormError("");
        setFormData({
            name: "",
            type: "expense"
        });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setFormError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const name = formData.name.trim();

        if (!name) {
            setFormError("Category name is required.");
            return;
        }

        if (!["income", "expense"].includes(formData.type)) {
            setFormError("Please select a valid category type.");
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            if (editingCategory) {
                const response = await api.put(
                    `/categories/${editingCategory.id}`,
                    {
                        name,
                        type: formData.type
                    }
                );

                const updatedCategory = response.data?.category;

                if (updatedCategory) {
                    setCategories((previous) =>
                        previous.map((category) =>
                            category.id === updatedCategory.id
                                ? updatedCategory
                                : category
                        )
                    );
                }
            } else {
                const response = await api.post("/categories", {
                    name,
                    type: formData.type
                });

                const createdCategory = response.data?.category;

                if (createdCategory) {
                    setCategories((previous) => [
                        ...previous,
                        createdCategory
                    ]);
                }
            }

            closeModal();
        } catch (err) {
            console.error("Save category error:", err);

            setFormError(
                err.response?.data?.message ||
                "Unable to save category. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        // System/default categories cannot be deleted.
        if (category.user_id === null) {
            return;
        }

        const confirmed = window.confirm(
            `Delete "${category.name}"? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(`/categories/${category.id}`);

            setCategories((previous) =>
                previous.filter(
                    (item) => item.id !== category.id
                )
            );
        } catch (err) {
            console.error("Delete category error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to delete category."
            );
        }
    };

    const getCategoryIcon = (type) => {
        return type === "income" ? "↗" : "↘";
    };

    const renderCategoryList = (items, type) => {
        if (items.length === 0) {
            return (
                <div className="categories-empty-list">
                    <div className="categories-empty-icon">
                        {type === "income" ? "↗" : "↘"}
                    </div>

                    <p>
                        No {type} categories yet.
                    </p>

                    <button
                        type="button"
                        className="category-inline-add"
                        onClick={() => openAddModal(type)}
                    >
                        + Add {type} category
                    </button>
                </div>
            );
        }

        return (
            <div className="category-list">
                {items.map((category) => {
                    const isDefault = category.user_id === null;

                    return (
                        <div
                            className="category-row"
                            key={category.id}
                        >
                            <div className="category-row-left">
                                <div
                                    className={`category-icon ${
                                        type === "income"
                                            ? "income-icon"
                                            : "expense-icon"
                                    }`}
                                >
                                    {getCategoryIcon(type)}
                                </div>

                                <div>
                                    <div className="category-name">
                                        {category.name}
                                    </div>

                                    <div className="category-source">
                                        {isDefault
                                            ? "Default category"
                                            : "Personal category"}
                                    </div>
                                </div>
                            </div>

                            {!isDefault && (
                                <div className="category-actions">
                                    <button
                                        type="button"
                                        className="category-edit-button"
                                        onClick={() =>
                                            openEditModal(category)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="category-delete-button"
                                        onClick={() =>
                                            handleDelete(category)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="categories-page">
            <div className="categories-header">
                <div>
                    <h1>Categories</h1>
                    <p>
                        Organize your income and expenses.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-category-button"
                    onClick={() => openAddModal()}
                >
                    <span>+</span>
                    Add Category
                </button>
            </div>

            {error && (
                <div className="categories-error">
                    {error}

                    {error.includes("session") && (
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="categories-loading">
                    Loading categories...
                </div>
            ) : (
                <div className="categories-grid">
                    <section className="category-section">
                        <div className="category-section-header">
                            <div>
                                <h2>Expense Categories</h2>
                                <p>
                                    Categories used for money you spend.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="section-add-button"
                                onClick={() => openAddModal("expense")}
                            >
                                + Add
                            </button>
                        </div>

                        {renderCategoryList(
                            expenseCategories,
                            "expense"
                        )}
                    </section>

                    <section className="category-section">
                        <div className="category-section-header">
                            <div>
                                <h2>Income Categories</h2>
                                <p>
                                    Categories used for money you receive.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="section-add-button"
                                onClick={() => openAddModal("income")}
                            >
                                + Add
                            </button>
                        </div>

                        {renderCategoryList(
                            incomeCategories,
                            "income"
                        )}
                    </section>
                </div>
            )}

            {showModal && (
                <div
                    className="category-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !saving
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="category-modal">
                        <div className="category-modal-header">
                            <div>
                                <h2>
                                    {editingCategory
                                        ? "Edit Category"
                                        : "Add Category"}
                                </h2>

                                <p>
                                    {editingCategory
                                        ? "Update your category details."
                                        : "Create a category for your transactions."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="category-close-button"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="category-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="category-form-group">
                                <label htmlFor="category-name">
                                    Category Name
                                </label>

                                <input
                                    id="category-name"
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Groceries"
                                    value={formData.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    autoFocus
                                />
                            </div>

                            <div className="category-form-group">
                                <label htmlFor="category-type">
                                    Category Type
                                </label>

                                <select
                                    id="category-type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="expense">
                                        Expense
                                    </option>

                                    <option value="income">
                                        Income
                                    </option>
                                </select>
                            </div>

                            {formError && (
                                <div className="category-form-error">
                                    {formError}
                                </div>
                            )}

                            <div className="category-modal-actions">
                                <button
                                    type="button"
                                    className="category-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="category-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingCategory
                                            ? "Save Changes"
                                            : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Categories;