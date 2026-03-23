import React, { useEffect, useState } from "react";
import CountUp from "react-countup";

function VivaAnalytics({ changeMenu }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/viva/history", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistory([]);
    }
    setLoading(false);
  };

  const totalSessions = history.length;
  const scores = history.map((item) =>
    Number(item.average_score || 0)
  );

  const overallAverage =
    totalSessions > 0
      ? scores.reduce((a, b) => a + b, 0) / totalSessions
      : 0;

  const bestScore =
    totalSessions > 0 ? Math.max(...scores) : 0;

  const recentSessions = history.slice(0, 3);

  const getScoreColor = (score) => {
    if (score >= 8) return "#22c55e";
    if (score >= 5) return "#facc15";
    return "#ef4444";
  };

  const getTrend = () => {
    if (scores.length < 2) return "Stable";

    const last = scores[0];
    const prev = scores[1];

    if (last > prev) return "Improving";
    if (last < prev) return "Declining";
    return "Stable";
  };

  const getTrendColor = () => {
    if (getTrend() === "Improving") return "#22c55e";
    if (getTrend() === "Declining") return "#ef4444";
    return "#94a3b8";
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📈 Viva Analytics Dashboard</h2>

      {loading ? (
        <p style={styles.noData}>Loading...</p>
      ) : totalSessions === 0 ? (
        <p style={styles.noData}>No viva sessions yet.</p>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <h4 style={styles.cardTitle}>Total Sessions</h4>
              <div style={styles.gradientNumber}>
                <CountUp end={totalSessions} duration={1.2} />
              </div>
            </div>

            <div style={styles.summaryCard}>
              <h4 style={styles.cardTitle}>Overall Average</h4>
              <div style={styles.highlightNumber}>
                <CountUp end={overallAverage} decimals={2} duration={1.2} />
              </div>
              <div style={{ ...styles.trend, color: getTrendColor() }}>
                {getTrend()}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <h4 style={styles.cardTitle}>Best Score</h4>
              <div style={styles.highlightNumber}>
                <CountUp end={bestScore} duration={1.2} />
              </div>
            </div>
          </div>

          {/* PERFORMANCE GRAPH */}
          <div style={styles.graphContainer}>
            <h3 style={styles.sectionTitle}>Performance Overview</h3>
            <div style={styles.graphRow}>
              {scores.map((score, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.graphBar,
                    height: `${score * 12 + 10}px`,
                    background: getScoreColor(score)
                  }}
                />
              ))}
            </div>
          </div>

          {/* RECENT SESSIONS */}
          <div>
            <h3 style={styles.sectionTitle}>🕒 Recent Sessions</h3>

            {recentSessions.map((item, index) => {
              const score = Number(item.average_score || 0);

              return (
                <div
                  key={index}
                  style={{
                    ...styles.sessionCard,
                    borderLeft: `5px solid ${getScoreColor(score)}`
                  }}
                >
                  <div>
                    <h4 style={styles.sessionTitle}>{item.topic}</h4>
                    <p style={styles.date}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div
                    style={{
                      ...styles.scoreBox,
                      background: getScoreColor(score)
                    }}
                  >
                    {score}
                  </div>
                </div>
              );
            })}

            <button
              style={styles.viewAllBtn}
              onClick={() => changeMenu("viva-history")}
            >
              View Full History →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "35px" },
  title: { color: "#38bdf8", fontSize: "26px", fontWeight: "700" },

  summaryGrid: { display: "flex", gap: "25px" },

  summaryCard: {
    flex: 1,
    background: "rgba(15,23,42,0.95)",
    padding: "30px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 0 25px rgba(56,189,248,0.2)",
    transition: "0.3s"
  },

  cardTitle: { color: "#cbd5e1" },

  gradientNumber: {
    fontSize: "34px",
    fontWeight: "700",
    marginTop: "12px",
    background: "linear-gradient(90deg,#8b5cf6,#06b6d4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },

  highlightNumber: {
    fontSize: "32px",
    fontWeight: "700",
    marginTop: "12px",
    color: "#38bdf8"
  },

  trend: { marginTop: "8px", fontWeight: "600" },

  graphContainer: {
    background: "rgba(15,23,42,0.95)",
    padding: "25px",
    borderRadius: "15px"
  },

  sectionTitle: {
    color: "#38bdf8",
    marginBottom: "15px"
  },

  graphRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    height: "140px"
  },

  graphBar: {
    width: "25px",
    borderRadius: "6px",
    transition: "0.3s"
  },

  sessionCard: {
    background: "#1e293b",
    padding: "18px",
    borderRadius: "12px",
    marginBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#cbd5e1"
  },

  sessionTitle: { marginBottom: "5px", color: "#e2e8f0" },

  scoreBox: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    color: "white"
  },

  date: { fontSize: "12px", color: "#94a3b8" },

  viewAllBtn: {
    marginTop: "15px",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  },

  noData: { color: "#94a3b8" }
};

export default VivaAnalytics;