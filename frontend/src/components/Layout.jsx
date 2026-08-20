import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
    return (
        <div className="app-layout">

            {/* Sidebar */}
            <aside className="sidebar">

                <div className="logo">
                    <div className="logo-icon">
                        P
                    </div>

                    <span>
                        Pocket<span>Pilot</span>
                    </span>
                </div>

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

                    <NavLink to="/analytics">
                        <span>▥</span>
                        Analytics
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

                <div className="sidebar-bottom">

                    <div className="sidebar-user">
                        <div className="user-avatar">
                            A
                        </div>

                        <div>
                            <strong>Akbar</strong>
                            <small>Personal Account</small>
                        </div>
                    </div>

                </div>

            </aside>

            {/* Main Content */}
            <main className="main-content">

                <header className="topbar">

                    <div className="mobile-logo">
                        Pocket<span>Pilot</span>
                    </div>

                    <div className="topbar-actions">

                        <button className="icon-button">
                            🔔
                        </button>

                        <button className="profile-button">
                            A
                        </button>

                    </div>

                </header>

                <div className="page-content">
                    <Outlet />
                </div>

            </main>

        </div>
    );
};

export default Layout;