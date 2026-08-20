import { useEffect, useState } from "react";
import api from "../api/axios";

const Dashboard = () => {

    const [summary, setSummary] =
        useState(null);

    const [transactions, setTransactions] =
        useState([]);

    const [categorySpending, setCategorySpending] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {

        try {

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

            setSummary(
                summaryResponse.data.summary
            );

            setTransactions(
                transactionsResponse.data.transactions
            );

            setCategorySpending(
                categoryResponse.data.categories
            );

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>

            <h1>Dashboard</h1>

            {summary && (
                <div>

                    <h2>
                        Total Balance:
                        ₹{summary.totalBalance}
                    </h2>

                    <p>
                        Income:
                        ₹{summary.totalIncome}
                    </p>

                    <p>
                        Expenses:
                        ₹{summary.totalExpenses}
                    </p>

                    <p>
                        Net Income:
                        ₹{summary.netIncome}
                    </p>

                </div>
            )}

            <hr />

            <h2>
                Recent Transactions
            </h2>

            {transactions.map(
                (transaction) => (

                    <div
                        key={transaction.id}
                    >

                        <strong>
                            {transaction.description ||
                                transaction.category_name}
                        </strong>

                        {" - "}

                        {transaction.type ===
                        "income"
                            ? "+"
                            : "-"}

                        ₹{transaction.amount}

                    </div>

                )
            )}

            <hr />

            <h2>
                Spending by Category
            </h2>

            {categorySpending.map(
                (category) => (

                    <div
                        key={
                            category.category_id
                        }
                    >

                        {category.category_name}

                        {" - "}

                        ₹{category.total_spent}

                    </div>

                )
            )}

        </div>
    );
};

export default Dashboard;