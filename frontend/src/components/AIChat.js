import React, { useState } from "react";

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const token = localStorage.getItem("token");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const response = await fetch("http://127.0.0.1:5000/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();

    if (data.reply) {
      const botMessage = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  return (
    <div style={styles.chatBox}>
      <h3 style={styles.heading}>🤖 AI Assistant</h3>

      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background:
                msg.sender === "user" ? "#3b82f6" : "#1e293b"
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  chatBox: {
    background: "rgba(30,41,59,0.8)",
    padding: "20px",
    borderRadius: "16px",
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    height: "400px"
  },

  heading: {
    color: "#38bdf8",
    marginBottom: "15px"
  },

  messages: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "10px"
  },

  message: {
    padding: "10px 14px",
    borderRadius: "12px",
    color: "white",
    maxWidth: "70%"
  },

  inputRow: {
    display: "flex",
    gap: "10px"
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none"
  },

  button: {
    background: "#06b6d4",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer"
  }
};

export default AIChat;
