import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    element={<Layout />}
                >

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                </Route>

                <Route
                    path="/"
                    element={
                        <Navigate to="/dashboard" />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;