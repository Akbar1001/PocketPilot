import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

const Layout = () => {

    const { user } = useAuth();

    // Get user's name
    const userName = user?.name || user?.username || "User";

    // Get first letter for avatar
    const userInitial = userName
        .charAt(0)
        .toUpperCase();

    return (
        <div className="app-layout">

            {/* =========================
                SIDEBAR
            ========================== */}

            <aside className="sidebar">

                {/* LOGO */}

                <div className="logo">

                    <div className="logo-icon">
                        P
                    </div>

                    <span>
                        Pocket<span>Pilot</span>
                    </span>

                </div>


                {/* =========================
                    NAVIGATION
                ========================== */}

                <nav className="sidebar-nav">

                    <NavLink to="/dashboard">
                        <span>⌂</span>
                        Dashboard
                    </NavLink>

                    <NavLink to="/accounts">
                        <span>▣</span>
                        Accounts
                    </NavLink>

                    <NavLink to="/transactions">
                        <span>⇄</span>
                        Transactions
                    </NavLink>

                    <NavLink to="/categories">
                        <span>◉</span>
                        Categories
                    </NavLink>

                    <NavLink to="/budgets">
                        <span>◷</span>
                        Budgets
                    </NavLink>

                    <NavLink to="/Reports">
                        <span>▥</span>
                        Reports
                    </NavLink>

                    <NavLink to="/goals">
                        <span>◎</span>
                        Goals
                    </NavLink>

                    <NavLink to="/settings">
                        <span>⚙</span>
                        Settings
                    </NavLink>

                </nav>


                {/* =========================
                    SIDEBAR USER
                ========================== */}

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="user-avatar">
                            {userInitial}
                        </div>

                        <div>

                            <strong>
                                {userName}
                            </strong>

                            <small>
                                Personal Account
                            </small>

                        </div>

                    </div>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================== */}

            <main className="main-content">

                {/* TOP BAR */}

                <header className="topbar">

                    <div className="mobile-logo">
                        Pocket<span>Pilot</span>
                    </div>


                    <div className="topbar-actions">

                        <button className="icon-button">
                            🔔
                        </button>

                        <button className="profile-button">
                            {userInitial}
                        </button>

                    </div>

                </header>


                {/* PAGE CONTENT */}

                <div className="page-content">

                    <Outlet />

                </div>

            </main>

        </div>
    );
};

export default Layout;