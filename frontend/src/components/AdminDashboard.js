import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

  const navigate = useNavigate();
  // BYPASS AUTH: Always set token
  const token = "bypass-token";

  useEffect(() => {
    // BYPASS AUTH: Skip login check
    fetchUsers();
    fetchReports();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("http://127.0.0.1:5000/admin/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    // BYPASS AUTH: Remove 403 handling
    const data = await res.json();
    setUsers(data);
  };

  const fetchReports = async () => {
    const res = await fetch("http://127.0.0.1:5000/admin/reports", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setReports(data);
  };

  const deleteReport = async (id) => {
    await fetch(`http://127.0.0.1:5000/admin/delete-report/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchReports();
  };

  const logout = () => {
    // BYPASS AUTH: Just reload page
    window.location.reload();
  };

  return (
    <div style={styles.page}>
      
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>Admin Panel</h2>

        <div
          style={activeTab === "users" ? styles.activeMenu : styles.menu}
          onClick={() => setActiveTab("users")}
        >
          👤 Users
        </div>

        <div
          style={activeTab === "reports" ? styles.activeMenu : styles.menu}
          onClick={() => setActiveTab("reports")}
        >
          📄 Reports
        </div>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        
        {/* Stats Cards */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>

          <div style={styles.statCard}>
            <h3>Total Reports</h3>
            <p>{reports.length}</p>
          </div>
        </div>

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            <h2 style={styles.heading}>All Registered Users</h2>
            {users.map((user) => (
              <div key={user._id} style={styles.card}>
                <strong>{user.email}</strong>
                <div style={styles.roleBadge}>
                  {user.role === "admin" ? "Admin" : "User"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div>
            <h2 style={styles.heading}>All Generated Reports</h2>
            {reports.map((report) => (
              <div key={report._id} style={styles.card}>
                <div>
                  <strong>{report.aim}</strong>
                  <div style={styles.meta}>{report.email}</div>
                </div>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteReport(report._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a,#1e293b)"
  },

  sidebar: {
    width: "260px",
    background: "rgba(30,41,59,0.9)",
    backdropFilter: "blur(20px)",
    padding: "40px 25px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "5px 0 25px rgba(0,0,0,0.4)"
  },

  logo: {
    color: "#38bdf8",
    marginBottom: "40px"
  },

  menu: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    color: "#cbd5e1",
    cursor: "pointer"
  },

  activeMenu: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    background: "#334155",
    color: "#38bdf8",
    cursor: "pointer"
  },

  logoutBtn: {
    background: "#ef4444",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: "50px"
  },

  statsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px"
  },

  statCard: {
    flex: 1,
    background: "rgba(30,41,59,0.7)",
    backdropFilter: "blur(15px)",
    padding: "25px",
    borderRadius: "16px",
    color: "white",
    textAlign: "center",
    boxShadow: "0 0 25px rgba(56,189,248,0.2)"
  },

  heading: {
    color: "#38bdf8",
    marginBottom: "20px"
  },

  card: {
    background: "rgba(30,41,59,0.7)",
    padding: "20px",
    borderRadius: "14px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white"
  },

  meta: {
    fontSize: "13px",
    color: "#94a3b8"
  },

  roleBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#22c55e",
    fontSize: "12px"
  },

  deleteBtn: {
    background: "#ef4444",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer"
  }
};

export default AdminDashboard;
