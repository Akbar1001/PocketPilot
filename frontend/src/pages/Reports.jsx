import { useEffect, useState } from "react";
import api from "../api/axios";

import "./Reports.css";


function Reports() {

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
    });

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // LOAD REPORT DATA
    // ==========================================

    useEffect(() => {

        const loadReport = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    "/reports/summary"
                );

                console.log(
                    "Report response:",
                    response.data
                );

                if (response.data.success) {

                    setSummary(
                        response.data.summary || {
                            totalIncome: 0,
                            totalExpenses: 0,
                            balance: 0
                        }
                    );

                    setCategories(
                        response.data.categories || []
                    );

                } else {

                    setError(
                        response.data.message ||
                        "Unable to load financial report."
                    );
                }

            } catch (error) {

                console.error(
                    "Load report error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load financial report."
                );

            } finally {

                setLoading(false);
            }
        };


        loadReport();

    }, []);


    // ==========================================
    // FORMAT MONEY
    // ==========================================

    const formatMoney = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(Number(amount) || 0);

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="reports-page">

                <div className="reports-loading">
                    Loading financial report...
                </div>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="reports-page">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="reports-header">

                <div>

                    <h1>
                        Reports
                    </h1>

                    <p>
                        Understand your financial activity
                    </p>

                </div>

            </div>


            {/* ==================================
                ERROR
            ================================== */}

            {error && (

                <div className="reports-error">
                    {error}
                </div>

            )}


            {/* ==================================
                SUMMARY CARDS
            ================================== */}

            {!error && (

                <>

                    <div className="reports-summary-grid">

                        {/* TOTAL INCOME */}

                        <div className="report-summary-card">

                            <div className="report-card-icon income-icon">
                                ↑
                            </div>

                            <div className="report-card-content">

                                <p>
                                    Total Income
                                </p>

                                <h2>
                                    {formatMoney(
                                        summary.totalIncome
                                    )}
                                </h2>

                            </div>

                        </div>


                        {/* TOTAL EXPENSES */}

                        <div className="report-summary-card">

                            <div className="report-card-icon expense-icon">
                                ↓
                            </div>

                            <div className="report-card-content">

                                <p>
                                    Total Expenses
                                </p>

                                <h2>
                                    {formatMoney(
                                        summary.totalExpenses
                                    )}
                                </h2>

                            </div>

                        </div>


                        {/* BALANCE */}

                        <div className="report-summary-card">

                            <div className="report-card-icon balance-icon">
                                ₹
                            </div>

                            <div className="report-card-content">

                                <p>
                                    Net Balance
                                </p>

                                <h2
                                    className={
                                        Number(summary.balance) >= 0
                                            ? "positive-balance"
                                            : "negative-balance"
                                    }
                                >
                                    {formatMoney(
                                        summary.balance
                                    )}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        CATEGORY BREAKDOWN
                    ================================== */}

                    <div className="reports-section">

                        <div className="reports-section-header">

                            <div>

                                <h2>
                                    Category Breakdown
                                </h2>

                                <p>
                                    See where your money is going
                                </p>

                            </div>

                        </div>


                        {categories.length === 0 ? (

                            <div className="reports-empty">

                                <div className="reports-empty-icon">
                                    📊
                                </div>

                                <h3>
                                    No category data
                                </h3>

                                <p>
                                    Add some transactions to see
                                    your category breakdown.
                                </p>

                            </div>

                        ) : (

                            <div className="category-report-list">

                                {categories.map((category) => (

                                    <div
                                        className="category-report-row"
                                        key={category.id}
                                    >

                                        <div className="category-report-info">

                                            <div
                                                className={
                                                    category.type === "income"
                                                        ? "category-dot income-dot"
                                                        : "category-dot expense-dot"
                                                }
                                            />

                                            <div>

                                                <h3>
                                                    {category.name}
                                                </h3>

                                                <span>
                                                    {category.type === "income"
                                                        ? "Income"
                                                        : "Expense"}
                                                </span>

                                            </div>

                                        </div>


                                        <div
                                            className={
                                                category.type === "income"
                                                    ? "category-report-amount income-amount"
                                                    : "category-report-amount expense-amount"
                                            }
                                        >
                                            {formatMoney(
                                                category.total
                                            )}
                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>


                    {/* ==================================
                        FINANCIAL OVERVIEW
                    ================================== */}

                    <div className="financial-overview">

                        <div>

                            <h2>
                                Financial Overview
                            </h2>

                            <p>
                                Your current financial position
                                based on recorded transactions.
                            </p>

                        </div>


                        <div className="overview-values">

                            <div>

                                <span>
                                    Income
                                </span>

                                <strong className="overview-income">
                                    {formatMoney(
                                        summary.totalIncome
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Expenses
                                </span>

                                <strong className="overview-expense">
                                    {formatMoney(
                                        summary.totalExpenses
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Balance
                                </span>

                                <strong
                                    className={
                                        Number(summary.balance) >= 0
                                            ? "overview-balance-positive"
                                            : "overview-balance-negative"
                                    }
                                >
                                    {formatMoney(
                                        summary.balance
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                </>

            )}

        </div>
    );
}


export default Reports;