import React, { useState } from "react";

function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const sendMessage = async () => {
    if (!message) return;

    const newChat = [...chat, { type: "user", text: message }];
    setChat(newChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      setChat([
        ...newChat,
        { type: "bot", text: data.reply || "No response" }
      ]);
    } catch (error) {
      setChat([
        ...newChat,
        { type: "bot", text: "Server error." }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setOpen(!open)}
        style={styles.floatingBtn}
      >
        💬
      </div>

      {/* Chat Window */}
      {open && (
        <div style={styles.chatBox}>
          <div style={styles.header}>
            AI Assistant
          </div>

          <div style={styles.chatArea}>
            {chat.map((c, i) => (
              <div
                key={i}
                style={
                  c.type === "user"
                    ? styles.userMsg
                    : styles.botMsg
                }
              >
                {c.text}
              </div>
            ))}

            {loading && <div style={styles.botMsg}>Typing...</div>}
          </div>

          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything..."
            />
            <button style={styles.sendBtn} onClick={sendMessage}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  floatingBtn: {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 0 25px rgba(59,130,246,0.7)",
    color: "white",
    zIndex: 999
  },

  chatBox: {
    position: "fixed",
    bottom: "100px",
    right: "25px",
    width: "320px",
    height: "450px",
    background: "rgba(30,41,59,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 0 30px rgba(0,0,0,0.4)",
    zIndex: 999
  },

  header: {
    padding: "15px",
    fontWeight: "600",
    color: "#38bdf8",
    borderBottom: "1px solid rgba(255,255,255,0.1)"
  },

  chatArea: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  userMsg: {
    alignSelf: "flex-end",
    background: "#3b82f6",
    padding: "10px 14px",
    borderRadius: "12px",
    color: "white",
    maxWidth: "75%"
  },

  botMsg: {
    alignSelf: "flex-start",
    background: "#1e293b",
    padding: "10px 14px",
    borderRadius: "12px",
    color: "#e2e8f0",
    maxWidth: "75%"
  },

  inputArea: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid rgba(255,255,255,0.1)"
  },

  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    outline: "none"
  },

  sendBtn: {
    marginLeft: "8px",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#06b6d4",
    color: "white",
    cursor: "pointer"
  }
};

export default FloatingAIChat;
