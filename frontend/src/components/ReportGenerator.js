import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function ReportGenerator({
  aim,
  setAim,
  language,
  setLanguage,
  level,
  setLevel,
  mode,
  setMode,
  generateReport,
  loading,
  report
}) {
  const [displayText, setDisplayText] = useState("");

  // ==============================
  // Typing Effect Like ChatGPT
  // ==============================
  useEffect(() => {
    if (!report) return;

    let i = 0;
    setDisplayText("");

    const interval = setInterval(() => {
      setDisplayText((prev) => prev + report[i]);
      i++;
      if (i >= report.length) clearInterval(interval);
    }, 5);

    return () => clearInterval(interval);
  }, [report]);

  // ==============================
  // PREMIUM PDF DOWNLOAD
  // ==============================
  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0, 102, 204);
    doc.text("AutoLaB AI", pageWidth / 2, 60, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("Lab Practical Report", pageWidth / 2, 80, { align: "center" });

    doc.setFontSize(12);
    doc.text(
      `Generated On: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      120,
      { align: "center" }
    );

    doc.addPage();

    let y = 25;
    const lines = report.split("\n");

    lines.forEach((line) => {
      doc.setFontSize(11);
      doc.setTextColor(40);
      doc.setFont(undefined, "normal");

      const splitText = doc.splitTextToSize(line, maxWidth);

      splitText.forEach((txt) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 25;
        }
        doc.text(txt, margin, y);
        y += 7;
      });

      y += 3;
    });

    doc.save("AutoLaB_AI_Practical_Report.pdf");
  };

  return (
    <div>
      <h2 style={styles.heading}>Generate Lab Practical</h2>

      <input
        placeholder="Enter Lab Aim"
        value={aim}
        onChange={(e) => setAim(e.target.value)}
        style={styles.input}
      />

      <div style={styles.row}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={styles.select}
        >
          <option>Python</option>
          <option>Java</option>
          <option>C++</option>
          <option>C</option>
        </select>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          style={styles.select}
        >
          <option>Short</option>
          <option>Medium</option>
          <option>Detailed</option>
        </select>
      </div>

      <button style={styles.generateBtn} onClick={generateReport}>
        {loading ? "🤖 Generating Practical..." : "Generate Practical"}
      </button>

      {loading && (
        <div style={styles.thinking}>
          🤖 AI is writing your practical...
        </div>
      )}

      {report && (
        <>
          <div style={styles.reportBox}>
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div style={{ position: "relative" }}>
                      <button
                        style={styles.copyBtn}
                        onClick={() =>
                          navigator.clipboard.writeText(children)
                        }
                      >
                        Copy
                      </button>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code style={styles.inlineCode} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {displayText}
            </ReactMarkdown>
          </div>

          <button style={styles.downloadBtn} onClick={downloadPDF}>
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  heading: {
    color: "#38bdf8",
    marginBottom: "20px",
    fontSize: "22px"
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
    marginBottom: "15px",
    fontSize: "15px"
  },

  row: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px"
  },

  select: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    background: "#0f172a",
    color: "white",
    border: "1px solid #334155",
    fontSize: "14px"
  },

  generateBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(6,182,212,0.6)",
    marginBottom: "20px",
    fontSize: "15px"
  },

  thinking: {
    color: "#94a3b8",
    marginBottom: "15px",
    fontStyle: "italic"
  },

  reportBox: {
    background: "#0f172a",
    padding: "25px",
    borderRadius: "16px",
    maxHeight: "500px",
    overflowY: "auto",
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#e2e8f0",
    fontFamily: "'Inter', sans-serif"
  },

  inlineCode: {
    background: "#1e293b",
    padding: "3px 6px",
    borderRadius: "6px",
    color: "#38bdf8"
  },

  copyBtn: {
    position: "absolute",
    right: "10px",
    top: "10px",
    background: "#06b6d4",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
    cursor: "pointer"
  },

  downloadBtn: {
    marginTop: "20px",
    padding: "12px 28px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg,#22c55e,#16a34a)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 0 25px rgba(34,197,94,0.6)",
    transition: "0.3s"
  }
};

export default ReportGenerator;
