import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>AI Lab System</h2>

      <div>
        {token && (
          <>
            <button style={styles.btn} onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
            <button style={styles.logout} onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "#1e293b",
    padding: "15px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    color: "#38bdf8"
  },
  btn: {
    marginRight: "10px",
    background: "#3b82f6",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white"
  },
  logout: {
    background: "#ef4444",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white"
  }
};

export default Navbar;
