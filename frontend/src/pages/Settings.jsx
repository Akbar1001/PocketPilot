import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

import "./Settings.css";

function Settings() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [user, setUser] = useState({
        name: "",
        email: ""
    });

    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);

    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [currency, setCurrency] = useState(
        localStorage.getItem("currency") || "INR"
    );


    // ==========================================
    // LOAD USER
    // ==========================================

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await api.get("/auth/me");

                /*
                 * Your current /auth/me endpoint only
                 * returns the authenticated userId.
                 *
                 * So we first try localStorage because
                 * Login.jsx already stores the user there.
                 */

                const storedUser =
                    localStorage.getItem("user");

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

            } catch (error) {
                console.error(
                    "Load settings user error:",
                    error
                );
            } finally {
                setProfileLoading(false);
            }
        };

        loadUser();
    }, []);


    // ==========================================
    // PROFILE INPUT
    // ==========================================

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setUser((previous) => ({
            ...previous,
            [name]: value
        }));

        setProfileMessage("");
        setProfileError("");
    };


    // ==========================================
    // PASSWORD INPUT
    // ==========================================

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordData((previous) => ({
            ...previous,
            [name]: value
        }));

        setPasswordMessage("");
        setPasswordError("");
    };


    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        setProfileMessage("");
        setProfileError("");

        if (!user.name.trim()) {
            setProfileError("Name cannot be empty.");
            return;
        }

        setProfileSaving(true);

        try {
            const response = await api.put(
                "/users/profile",
                {
                    name: user.name
                }
            );

            const updatedUser =
                response.data.user;

            setUser(updatedUser);

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setProfileMessage(
                "Profile updated successfully."
            );

        } catch (error) {
            console.error(
                "Update profile error:",
                error
            );

            setProfileError(
                error.response?.data?.message ||
                "Unable to update profile."
            );
        } finally {
            setProfileSaving(false);
        }
    };


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
        ) {
            setPasswordError(
                "Please fill in all password fields."
            );
            return;
        }

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            setPasswordError(
                "New passwords do not match."
            );
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError(
                "New password must contain at least 6 characters."
            );
            return;
        }

        setPasswordSaving(true);

        try {
            await api.put(
                "/users/password",
                {
                    currentPassword:
                        passwordData.currentPassword,

                    newPassword:
                        passwordData.newPassword
                }
            );

            setPasswordMessage(
                "Password changed successfully."
            );

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (error) {
            console.error(
                "Change password error:",
                error
            );

            setPasswordError(
                error.response?.data?.message ||
                "Unable to change password."
            );
        } finally {
            setPasswordSaving(false);
        }
    };


    // ==========================================
    // CURRENCY
    // ==========================================

    const handleCurrencyChange = (event) => {
        const value = event.target.value;

        setCurrency(value);

        localStorage.setItem(
            "currency",
            value
        );
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        logout();
        navigate("/login");
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (profileLoading) {
        return (
            <div className="settings-page">

                <div className="settings-loading">
                    Loading settings...
                </div>

            </div>
        );
    }


    return (
        <div className="settings-page">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="settings-header">

                <div>
                    <h1>Settings</h1>

                    <p>
                        Manage your PocketPilot account
                        and preferences.
                    </p>
                </div>

            </div>


            {/* ==================================
                PROFILE
            ================================== */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div className="settings-card-icon">
                        👤
                    </div>

                    <div>
                        <h2>Profile</h2>

                        <p>
                            Update your personal information.
                        </p>
                    </div>

                </div>


                <form
                    className="settings-form"
                    onSubmit={handleProfileSubmit}
                >

                    <div className="settings-form-group">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={user.name || ""}
                            onChange={handleProfileChange}
                            placeholder="Enter your name"
                        />

                    </div>


                    <div className="settings-form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={user.email || ""}
                            disabled
                        />

                        <span className="settings-help">
                            Email address cannot be changed.
                        </span>

                    </div>


                    {profileError && (
                        <div className="settings-error">
                            {profileError}
                        </div>
                    )}


                    {profileMessage && (
                        <div className="settings-success">
                            {profileMessage}
                        </div>
                    )}


                    <div className="settings-actions">

                        <button
                            type="submit"
                            className="settings-primary-button"
                            disabled={profileSaving}
                        >
                            {profileSaving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </section>


            {/* ==================================
                SECURITY
            ================================== */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div className="settings-card-icon">
                        🔒
                    </div>

                    <div>
                        <h2>Security</h2>

                        <p>
                            Keep your account secure.
                        </p>
                    </div>

                </div>


                <form
                    className="settings-form"
                    onSubmit={handlePasswordSubmit}
                >

                    <div className="settings-form-group">

                        <label htmlFor="currentPassword">
                            Current Password
                        </label>

                        <input
                            id="currentPassword"
                            type="password"
                            name="currentPassword"
                            value={
                                passwordData.currentPassword
                            }
                            onChange={
                                handlePasswordChange
                            }
                            placeholder="Enter current password"
                        />

                    </div>


                    <div className="settings-form-group">

                        <label htmlFor="newPassword">
                            New Password
                        </label>

                        <input
                            id="newPassword"
                            type="password"
                            name="newPassword"
                            value={
                                passwordData.newPassword
                            }
                            onChange={
                                handlePasswordChange
                            }
                            placeholder="Enter new password"
                        />

                    </div>


                    <div className="settings-form-group">

                        <label htmlFor="confirmPassword">
                            Confirm New Password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={
                                passwordData.confirmPassword
                            }
                            onChange={
                                handlePasswordChange
                            }
                            placeholder="Confirm new password"
                        />

                    </div>


                    {passwordError && (
                        <div className="settings-error">
                            {passwordError}
                        </div>
                    )}


                    {passwordMessage && (
                        <div className="settings-success">
                            {passwordMessage}
                        </div>
                    )}


                    <div className="settings-actions">

                        <button
                            type="submit"
                            className="settings-primary-button"
                            disabled={passwordSaving}
                        >
                            {passwordSaving
                                ? "Changing..."
                                : "Change Password"}
                        </button>

                    </div>

                </form>

            </section>


            {/* ==================================
                PREFERENCES
            ================================== */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div className="settings-card-icon">
                        ⚙️
                    </div>

                    <div>
                        <h2>Preferences</h2>

                        <p>
                            Customize how PocketPilot
                            displays your finances.
                        </p>
                    </div>

                </div>


                <div className="settings-form">

                    <div className="settings-form-group">

                        <label htmlFor="currency">
                            Currency
                        </label>

                        <select
                            id="currency"
                            value={currency}
                            onChange={handleCurrencyChange}
                        >

                            <option value="INR">
                                ₹ Indian Rupee (INR)
                            </option>

                            <option value="USD">
                                $ US Dollar (USD)
                            </option>

                            <option value="EUR">
                                € Euro (EUR)
                            </option>

                            <option value="GBP">
                                £ British Pound (GBP)
                            </option>

                        </select>

                        <span className="settings-help">
                            This preference is saved locally
                            for now.
                        </span>

                    </div>

                </div>

            </section>


            {/* ==================================
                ACCOUNT ACTIONS
            ================================== */}

            <section className="settings-card danger-card">

                <div className="settings-card-header">

                    <div className="settings-card-icon danger-icon">
                        ⚠️
                    </div>

                    <div>
                        <h2>Account</h2>

                        <p>
                            Manage your current session.
                        </p>
                    </div>

                </div>


                <div className="settings-logout-row">

                    <div>
                        <strong>
                            Sign out of PocketPilot
                        </strong>

                        <p>
                            You will be redirected to
                            the login page.
                        </p>
                    </div>


                    <button
                        type="button"
                        className="settings-logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </section>

        </div>
    );
}

export default Settings;
