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

import Login from "./pages/Login";
import Signup from "./pages/Signup";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Public routes */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />


                {/* Protected routes */}

                <Route element={<ProtectedRoute />}>

                    <Route element={<Layout />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/accounts"
                            element={<Accounts />}
                        />

                    </Route>

                </Route>


                {/* Default route */}

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