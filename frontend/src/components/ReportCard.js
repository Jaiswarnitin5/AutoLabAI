import React from "react";

function ReportCard({ report, onView, onDelete }) {
  return (
    <div style={styles.card}>
      <div>
        <strong>{report.aim}</strong>
        <div style={styles.meta}>
          {report.language} | {report.level}
        </div>
      </div>

      <div>
        <button style={styles.viewBtn} onClick={() => onView(report.text)}>
          View
        </button>

        <button style={styles.deleteBtn} onClick={() => onDelete(report._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#0f172a",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  meta: {
    fontSize: "12px",
    color: "#94a3b8"
  },
  viewBtn: {
    marginRight: "8px",
    background: "#3b82f6",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer"
  },
  deleteBtn: {
    background: "#ef4444",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer"
  }
};

export default ReportCard;
SX