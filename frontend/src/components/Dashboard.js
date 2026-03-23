import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import ReportGenerator from "./ReportGenerator";
import ReportHistory from "./ReportHistory";
import FloatingAIChat from "./FloatingAIChat";
import VivaPage from "./VivaPage";
import VivaHistory from "./VivaHistory";
import VivaAnalytics from "./VivaAnalytics";

function Dashboard() {
  const [aim, setAim] = useState("");
  const [language, setLanguage] = useState("Python");
  const [level, setLevel] = useState("Medium");
  const [mode, setMode] = useState("Intermediate");
  const [report, setReport] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [fade, setFade] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
  const savedMenu = localStorage.getItem("activeMenu");
  if (savedMenu) {
    setActiveMenu(savedMenu);
    localStorage.removeItem("activeMenu");
  }

  const token = localStorage.getItem("token");
  if (token) {
    fetchReports(token);
  }
}, []);

const fetchReports = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://127.0.0.1:5000/my-reports", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.status === 403) {
      console.log("Token invalid or expired");
      localStorage.clear();
      navigate("/login");
      return;
    }

    const data = await response.json();
    setReports(Array.isArray(data) ? data : []);

  } catch (err) {
    console.log("Fetch error:", err);
  }
};
  // ================= GENERATE REPORT =================
  const generateReport = async () => {
    if (!aim) return alert("Enter aim first!");

    setLoading(true);
    setReport("");

    const response = await fetch("http://127.0.0.1:5000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ aim, language, level, mode })
    });

    const data = await response.json();
    setLoading(false);

    if (data.error) return alert(data.error);

    setReport(data.text);
    fetchReports();
  };

  // ================= DELETE REPORT =================
  const deleteReport = async (id) => {
    await fetch("http://127.0.0.1:5000/delete-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });

    fetchReports();
  };

  // ================= DOWNLOAD PDF =================
  const downloadPDF = (text) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save("Lab_Report.pdf");
  };

  const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
};

  const changeMenu = (menu) => {
    setFade(false);
    setTimeout(() => {
      setActiveMenu(menu);
      setFade(true);
    }, 200);
  };

  return (
    <div style={styles.page}>
      {/* ================= SIDEBAR ================= */}
      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>AutoLaB AI</h2>

          <SidebarItem
            label="📊 Dashboard"
            menu="dashboard"
            activeMenu={activeMenu}
            changeMenu={changeMenu}
          />

          <SidebarItem
            label="📁 My Reports"
            menu="reports"
            activeMenu={activeMenu}
            changeMenu={changeMenu}
            badge={reports.length}
          />

          <SidebarItem
            label="🎤 Viva Practice"
            menu="viva"
            activeMenu={activeMenu}
            changeMenu={changeMenu}
          />

          <SidebarItem
            label="📜 Viva History"
            menu="viva-history"
            activeMenu={activeMenu}
            changeMenu={changeMenu}
          />

          <SidebarItem
            label="📈 Analytics"
            menu="analytics"
            activeMenu={activeMenu}
            changeMenu={changeMenu}
          />

          <SidebarItem
            label="⚙ Settings"
            menu="settings"
            activeMenu={activeMenu}
            changeMenu={changeMenu}
          />
        </div>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>

      {/* ================= MAIN ================= */}
      <div
        style={{
          ...styles.main,
          opacity: fade ? 1 : 0,
          transform: fade ? "translateY(0px)" : "translateY(10px)",
          transition: "0.3s ease"
        }}
      >
        {activeMenu === "dashboard" && (
          <div style={styles.card}>
            <ReportGenerator
              aim={aim}
              setAim={setAim}
              language={language}
              setLanguage={setLanguage}
              level={level}
              setLevel={setLevel}
              mode={mode}
              setMode={setMode}
              generateReport={generateReport}
              loading={loading}
              report={report}
              downloadPDF={downloadPDF}
            />
          </div>
        )}

        {activeMenu === "reports" && (
          <div style={styles.card}>
            <ReportHistory
              reports={reports}
              onView={setReport}
              onDelete={deleteReport}
            />
          </div>
        )}

        {activeMenu === "viva" && (
          <div style={styles.card}>
            <VivaPage />
          </div>
        )}

        {activeMenu === "viva-history" && (
          <div style={styles.card}>
            <VivaHistory />
          </div>
        )}

        {activeMenu === "analytics" && (
  <div style={styles.card}>
    <VivaAnalytics changeMenu={changeMenu} />
  </div>
)}

        {activeMenu === "settings" && (
          <div style={styles.card}>
            <h3 style={{ color: "#38bdf8" }}>⚙ Settings</h3>
            <p style={{ color: "#94a3b8" }}>
              More advanced features coming soon...
            </p>
          </div>
        )}
      </div>

      <FloatingAIChat />
    </div>
  );
}

// ================= SIDEBAR ITEM COMPONENT =================
function SidebarItem({ label, menu, activeMenu, changeMenu, badge }) {
  return (
    <div
      style={{
        ...styles.menuItem,
        ...(activeMenu === menu && styles.activeMenu)
      }}
      onClick={() => changeMenu(menu)}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span style={styles.badge}>{badge}</span>
      )}
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a,#111827,#1e293b)"
  },
  sidebar: {
    width: "260px",
    background: "rgba(15,23,42,0.95)",
    padding: "40px 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "5px 0 25px rgba(0,0,0,0.3)"
  },
  logo: {
    color: "#38bdf8",
    marginBottom: "60px",
    fontWeight: "700",
    fontSize: "20px"
  },
  menuItem: {
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "18px",
    color: "#cbd5e1",
    cursor: "pointer",
    transition: "0.3s",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  activeMenu: {
    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    color: "white",
    boxShadow: "0 0 25px rgba(59,130,246,0.6)"
  },
  badge: {
    background: "#0f172a",
    color: "#38bdf8",
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    border: "1px solid #38bdf8"
  },
  logoutBtn: {
    background: "linear-gradient(90deg,#ef4444,#dc2626)",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 0 20px rgba(239,68,68,0.5)"
  },
  main: {
    flex: 1,
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    gap: "40px"
  },
  card: {
    background: "rgba(30,41,59,0.85)",
    backdropFilter: "blur(25px)",
    padding: "35px",
    borderRadius: "20px",
    boxShadow: "0 0 50px rgba(56,189,248,0.15)"
  }
};

export default Dashboard;