import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";


const Dashboard = () => {

    // -----------------------------
    // STATE
    // -----------------------------

    const [summary, setSummary] = useState(null);

    const [transactions, setTransactions] =
        useState([]);

    const [categorySpending, setCategorySpending] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // -----------------------------
    // CONVERT BACKEND DATA
    // INTO CHART DATA
    // -----------------------------

    const chartData = categorySpending.map(
        (category) => ({
            name: category.category_name,
            value:
                Number(category.total_spent) || 0
        })
    );


    // -----------------------------
    // CHART COLORS
    // -----------------------------

    const chartColors = [
        "#1769ff",
        "#12b76a",
        "#f79009",
        "#7f56d9",
        "#f04438",
        "#06aed4",
        "#ec4a0a",
        "#667085"
    ];


    // -----------------------------
    // FETCH DASHBOARD DATA
    // -----------------------------

    useEffect(() => {
        fetchDashboardData();
    }, []);


    const fetchDashboardData = async () => {

        try {

            setLoading(true);

            setError("");


            // Make all API requests together

            const [
                summaryResponse,
                transactionsResponse,
                categoryResponse
            ] = await Promise.all([

                api.get(
                    "/dashboard/summary"
                ),

                api.get(
                    "/dashboard/recent-transactions"
                ),

                api.get(
                    "/dashboard/category-spending"
                )

            ]);


            // Check backend responses

            console.log(
                "Summary:",
                summaryResponse.data
            );

            console.log(
                "Transactions:",
                transactionsResponse.data
            );

            console.log(
                "Categories:",
                categoryResponse.data
            );


            // Save data into state

            setSummary(
                summaryResponse.data.summary
            );


            setTransactions(
                transactionsResponse.data.transactions ||
                []
            );


            setCategorySpending(
                categoryResponse.data.categories ||
                []
            );


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

        }

    };


    // -----------------------------
    // LOADING SCREEN
    // -----------------------------

    if (loading) {

        return (

            <div className="dashboard-page">

                <div className="dashboard-loading">

                    Loading your dashboard...

                </div>

            </div>

        );

    }


    // -----------------------------
    // DASHBOARD
    // -----------------------------

    return (

        <div className="dashboard-page">


            {/* =========================
                HEADER
            ========================== */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Good Morning, Akbar 👋
                    </h1>

                    <p>
                        Here's what's happening
                        with your finances today.
                    </p>

                </div>


                <div className="date-control">

                    This Month ▾

                </div>

            </div>


            {/* =========================
                ERROR MESSAGE
            ========================== */}

            {error && (

                <div className="dashboard-error">

                    {error}

                </div>

            )}


            {/* =========================
                SUMMARY CARDS
            ========================== */}

            <div className="summary-grid">


                {/* TOTAL BALANCE */}

                <div className="summary-card">

                    <div className="summary-card-header">

                        <div className="summary-icon">
                            ₹
                        </div>

                        <h3>
                            Total Balance
                        </h3>

                    </div>


                    <div className="summary-value">

                        ₹
                        {Number(
                            summary?.totalBalance || 0
                        ).toLocaleString("en-IN")}

                    </div>


                    <div className="summary-description">

                        Across all accounts

                    </div>

                </div>


                {/* TOTAL INCOME */}

                <div className="summary-card">

                    <div className="summary-card-header">

                        <div className="summary-icon income-icon">
                            ↑
                        </div>

                        <h3>
                            Total Income
                        </h3>

                    </div>


                    <div className="summary-value">

                        ₹
                        {Number(
                            summary?.totalIncome || 0
                        ).toLocaleString("en-IN")}

                    </div>


                    <div className="summary-description">

                        This month

                    </div>

                </div>


                {/* TOTAL EXPENSES */}

                <div className="summary-card">

                    <div className="summary-card-header">

                        <div className="summary-icon expense-icon">
                            ↓
                        </div>

                        <h3>
                            Total Expenses
                        </h3>

                    </div>


                    <div className="summary-value">

                        ₹
                        {Number(
                            summary?.totalExpenses || 0
                        ).toLocaleString("en-IN")}

                    </div>


                    <div className="summary-description">

                        This month

                    </div>

                </div>


                {/* NET SAVINGS */}

                <div className="summary-card">

                    <div className="summary-card-header">

                        <div className="summary-icon savings-icon">
                            ↗
                        </div>

                        <h3>
                            Net Savings
                        </h3>

                    </div>


                    <div className="summary-value">

                        ₹
                        {Number(
                            summary?.netIncome || 0
                        ).toLocaleString("en-IN")}

                    </div>


                    <div className="summary-description">

                        Income - Expenses

                    </div>

                </div>

            </div>


            {/* =========================
                TRANSACTIONS + PIE CHART
            ========================== */}

            <div className="dashboard-grid">


                {/* =====================
                    RECENT TRANSACTIONS
                ====================== */}

                <div className="dashboard-card">

                    <div className="card-title-row">

                        <h2>
                            Recent Transactions
                        </h2>

                        <button
                            className="view-all-button"
                        >
                            View All
                        </button>

                    </div>


                    {transactions.length === 0 ? (

                        <div className="empty-state">

                            No transactions found.

                        </div>

                    ) : (

                        <div className="transactions-list">

                            {transactions.map(
                                (transaction) => (

                                    <div
                                        className="transaction-row"
                                        key={transaction.id}
                                    >


                                        {/* Transaction information */}

                                        <div className="transaction-info">

                                            <strong>

                                                {
                                                    transaction.description ||
                                                    transaction.category_name ||
                                                    "Transaction"
                                                }

                                            </strong>


                                            <span className="transaction-category">

                                                {
                                                    transaction.category_name ||
                                                    "General"
                                                }

                                            </span>

                                        </div>


                                        {/* Transaction amount */}

                                        <div
                                            className={
                                                transaction.type ===
                                                "income"
                                                    ? "transaction-income"
                                                    : "transaction-expense"
                                            }
                                        >

                                            {
                                                transaction.type ===
                                                "income"
                                                    ? "+"
                                                    : "-"
                                            }

                                            ₹

                                            {Number(
                                                transaction.amount
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* =====================
                    EXPENSE DISTRIBUTION
                ====================== */}

                <div className="dashboard-card">


                    <div className="card-title-row">

                        <h2>
                            Expense Distribution
                        </h2>

                    </div>


                    {chartData.length === 0 ? (

                        <div className="empty-state">

                            No spending data available.

                        </div>

                    ) : (

                        <div className="pie-chart-container">


                            <ResponsiveContainer
                                width="100%"
                                height={280}
                            >

                                <PieChart>


                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={105}
                                        paddingAngle={3}
                                    >

                                        {chartData.map(
                                            (
                                                entry,
                                                index
                                            ) => (

                                                <Cell
                                                    key={
                                                        `cell-${index}`
                                                    }
                                                    fill={
                                                        chartColors[
                                                            index %
                                                            chartColors.length
                                                        ]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>


                                    <Tooltip
                                        formatter={(value) =>
                                            `₹${Number(
                                                value
                                            ).toLocaleString(
                                                "en-IN"
                                            )}`
                                        }
                                    />


                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </div>

            </div>


            {/* =========================
                BAR CHART
            ========================== */}

            <div className="dashboard-card category-analysis-card">


                <div className="card-title-row">

                    <div>

                        <h2>
                            Spending by Category
                        </h2>

                        <p className="chart-subtitle">

                            Where your money is going
                            this month

                        </p>

                    </div>

                </div>


                {chartData.length === 0 ? (

                    <div className="empty-state">

                        No spending data available.

                    </div>

                ) : (

                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <BarChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 20,
                                left: 10,
                                bottom: 10
                            }}
                        >


                            <CartesianGrid
                                strokeDasharray="3 3"
                            />


                            <XAxis
                                dataKey="name"
                            />


                            <YAxis />


                            <Tooltip
                                formatter={(value) =>
                                    `₹${Number(
                                        value
                                    ).toLocaleString(
                                        "en-IN"
                                    )}`
                                }
                            />


                            <Bar
                                dataKey="value"
                                name="Expenses"
                                fill="#1769ff"
                                radius={[
                                    6,
                                    6,
                                    0,
                                    0
                                ]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                )}

            </div>

        </div>

    );

};


export default Dashboard;