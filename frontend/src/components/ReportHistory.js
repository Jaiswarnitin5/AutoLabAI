import React from "react";

function ReportHistory({ reports, onView, onDelete }) {
  return (
    <div>
      {reports.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No reports yet.</p>
      ) : (
        reports.map((item) => (
          <div key={item._id} style={styles.reportCard}>

            <div>
              <strong style={styles.title}>{item.aim}</strong>

              <div style={styles.meta}>
                Generated Report
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                style={styles.viewBtn}
                onClick={() => onView(item.text)}
              >
                View
              </button>

              <button
                style={styles.deleteBtn}
                onClick={() => onDelete(item._id)}
              >
                Delete
              </button>
            </div>

          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  reportCard: {
    background: "rgba(51,65,85,0.6)",
    padding: "15px",
    borderRadius: "14px",
    marginBottom: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: "14px"
  },

  meta: {
    fontSize: "12px",
    color: "#cbd5e1",
    marginTop: "4px"
  },

  buttonGroup: {
    display: "flex",
    gap: "8px"
  },

  viewBtn: {
    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    color: "white",
    fontSize: "12px",
    cursor: "pointer"
  },

  deleteBtn: {
    background: "#ef4444",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    color: "white",
    fontSize: "12px",
    cursor: "pointer"
  }
};

export default ReportHistory;