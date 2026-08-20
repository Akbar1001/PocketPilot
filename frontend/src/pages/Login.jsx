import { useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import api from "../api/axios";

import { useAuth } from "../context/AuthContext";

import "./Auth.css";


function Login() {

    const navigate = useNavigate();

    // Get login function from AuthContext
    const { login } = useAuth();


    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });


    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    // Handle input changes
    const handleChange = (event) => {

        const { name, value } =
            event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };


    // Handle login
    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);


        try {

            // Send login request to backend
            const response = await api.post(
                "/auth/login",
                formData
            );


            const data = response.data;


            /*
             * Instead of manually writing to
             * localStorage, use AuthContext.
             *
             * This does TWO things:
             *
             * 1. Saves authentication information
             * 2. Updates React authentication state
             */
            login(
                data.accessToken,
                data.refreshToken,
                data.user
            );


            // Login successful
            // Move user to dashboard
            navigate("/dashboard", {
                replace: true
            });


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );


        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <h1>
                        Welcome Back
                    </h1>

                    <p>
                        Login to your PocketPilot account
                    </p>

                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    {/* Email */}

                    <div className="auth-form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* Password */}

                    <div className="auth-form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* Error */}

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {/* Login button */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"
                        }

                    </button>

                </form>


                {/* Signup link */}

                <div className="auth-footer">

                    Don't have an account?{" "}

                    <Link to="/signup">
                        Sign up
                    </Link>

                </div>

            </div>

        </div>
    );
}


export default Login;