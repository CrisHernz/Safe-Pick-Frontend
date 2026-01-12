import React from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import { getInitials, generateColorFromText } from "../../utils/helpers";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const fullName = authService.getFullName();
  const roleName = authService.getRoleName();

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 className="navbar-title">🎓 Safe Pick</h1>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{fullName}</span>
            <span className="user-role">{roleName}</span>
          </div>
          <div
            className="user-avatar"
            style={{ backgroundColor: generateColorFromText(fullName) }}
          >
            {getInitials(fullName)}
          </div>
          <button
            className="btn-logout"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
