import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ==========================================
                    PUBLIC ROUTES
                ========================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />


                {/* ==========================================
                    PROTECTED ROUTES
                ========================================== */}

                <Route element={<ProtectedRoute />}>

                    <Route element={<Layout />}>

                        {/* Dashboard */}

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />


                        {/* Accounts */}

                        <Route
                            path="/accounts"
                            element={<Accounts />}
                        />


                        {/* Transactions */}

                        <Route
                            path="/transactions"
                            element={<Transactions />}
                        />


                        {/* Categories */}

                        <Route
                            path="/categories"
                            element={<Categories />}
                        />

                        {/* Budgets */}
    
                        <Route
                            path="/budgets"
                            element={<Budgets />}
                        /> 

                        {/* Reports */}

                        <Route
                            path="/reports"
                            element={<Reports />}
                        />

                    </Route>

                </Route>


                {/* ==========================================
                    DEFAULT ROUTE
                ========================================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;