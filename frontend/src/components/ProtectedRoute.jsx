import {
    Navigate,
    Outlet
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function ProtectedRoute() {

    const { token } = useAuth();


    // User is not authenticated
    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    // User is authenticated
    return <Outlet />;
}


export default ProtectedRoute;