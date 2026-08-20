import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";

import "./Auth.css";

function Signup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // Handle input changes
    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };


    // Handle signup
    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            await api.post(
                "/auth/register",
                formData
            );

            // Registration successful
            navigate("/login");

        } catch (error) {

            console.error("Signup error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to create account. Please try again."
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
                        Create Account
                    </h1>

                    <p>
                        Start managing your money with PocketPilot
                    </p>

                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    {/* Name */}

                    <div className="auth-form-group">

                        <label htmlFor="name">
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                    </div>


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
                            placeholder="Create a password"
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


                    {/* Signup button */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Sign Up"
                        }
                    </button>

                </form>


                {/* Login link */}

                <div className="auth-footer">

                    Already have an account?{" "}

                    <Link to="/login">
                        Login
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Signup;