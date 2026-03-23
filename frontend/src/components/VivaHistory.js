import React, { useEffect, useState } from "react";

function VivaHistory() {
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
      console.log(err);
      setHistory([]);
    }

    setLoading(false);
  };

  const deleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;

    await fetch(`http://127.0.0.1:5000/viva/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchHistory();
  };

  const reattemptSession = (topic) => {
    // Navigate back to viva page with topic
    window.location.href = "/dashboard"; 
    localStorage.setItem("reattempt_topic", topic);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "#22c55e";
    if (score >= 5) return "#facc15";
    return "#ef4444";
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📚 Viva History</h2>

      {loading ? (
        <p style={styles.noData}>Loading history...</p>
      ) : history.length === 0 ? (
        <p style={styles.noData}>No viva sessions found.</p>
      ) : (
        history.map((item, index) => {
          const score = Number(item.average_score || 0);

          return (
            <div
              key={index}
              style={{
                ...styles.card,
                borderLeft: `6px solid ${getScoreColor(score)}`
              }}
            >
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.topic}>{item.topic}</h3>
                  <p style={styles.date}>
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <div
                  style={{
                    ...styles.scoreBadge,
                    background: getScoreColor(score)
                  }}
                >
                  {score}
                </div>
              </div>

              <div style={styles.buttonRow}>
                <button
                  style={styles.reattemptBtn}
                  onClick={() => reattemptSession(item.topic)}
                >
                  🔁 Re-attempt
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteSession(item.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },
  title: {
    color: "#38bdf8",
    fontSize: "26px",
    fontWeight: "700"
  },
  card: {
    background: "rgba(15,23,42,0.95)",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 0 25px rgba(56,189,248,0.2)",
    transition: "0.3s"
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  topic: {
    color: "#e2e8f0",
    marginBottom: "5px"
  },
  date: {
    fontSize: "13px",
    color: "#94a3b8"
  },
  scoreBadge: {
    padding: "10px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    color: "white"
  },
  buttonRow: {
    marginTop: "15px",
    display: "flex",
    gap: "15px"
  },
  reattemptBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  },
  deleteBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg,#ef4444,#dc2626)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  },
  noData: {
    color: "#94a3b8"
  }
};

export default VivaHistory;