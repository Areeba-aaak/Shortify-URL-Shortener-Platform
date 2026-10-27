
import {
  BarChart3,
  Link as LinkIcon,
  LogOut,
  Menu,
  ShieldCheck,
  X
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/login";
  };

  const isActive = (path) =>
    location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <Link to="/dashboard" className="brand">
          <div className="brand-icon">
            <LinkIcon size={22} />
          </div>

          <span>Shortify</span>
        </Link>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

        <div
          className={`nav-content ${
            mobileOpen ? "mobile-open" : ""
          }`}
        >
          <div className="nav-links">
            <Link
              to="/dashboard"
              className={
                isActive("/dashboard")
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() => setMobileOpen(false)}
            >
              <LinkIcon size={17} />
              URLs
            </Link>

            <Link
              to="/analytics"
              className={
                isActive("/analytics")
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() => setMobileOpen(false)}
            >
              <BarChart3 size={17} />
              Analytics
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={
                  isActive("/admin")
                    ? "nav-link active"
                    : "nav-link"
                }
                onClick={() => setMobileOpen(false)}
              >
                <ShieldCheck size={17} />
                Admin
              </Link>
            )}
          </div>

          <div className="nav-user">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
