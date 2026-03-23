import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

function VivaPage() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [result, setResult] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const token = localStorage.getItem("token");

  // ================= TIMER =================
  useEffect(() => {
    if (!sessionId || completed) return;

    if (timeLeft === 0) {
      submitAnswer();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, sessionId, completed]);

  // ================= SPEECH SETUP =================
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    // 🌍 Multi-language mapping
    if (language === "Hindi") {
      recognition.lang = "hi-IN";
    } else if (language === "Marathi") {
      recognition.lang = "mr-IN";
    } else if (language === "Gujarati") {
      recognition.lang = "gu-IN";
    } else {
      recognition.lang = "en-US";
    }

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, [language]);

  const startListening = () => {
    if (!recognitionRef.current)
      return alert("Speech recognition not supported in this browser.");
    setListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ================= START VIVA =================
  const startViva = async () => {
    if (!topic) return alert("Please enter a topic");

    const res = await fetch("http://127.0.0.1:5000/viva/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ topic, difficulty, language })
    });

    const data = await res.json();

    if (data.error) return alert(data.error);

    setSessionId(data.session_id);
    setQuestions(data.questions);
    setCurrent(0);
    setAnswer("");
    setEvaluation("");
    setCompleted(false);
    setTimeLeft(60);
  };

  // ================= SUBMIT ANSWER =================
  const submitAnswer = async () => {
    if (!answer) return alert("Please answer the question");

    const res = await fetch("http://127.0.0.1:5000/viva/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        session_id: sessionId,
        question: questions[current],
        answer
      })
    });

    const data = await res.json();

    if (data.error) return alert(data.error);

    setEvaluation(data.evaluation);
  };

  // ================= NEXT QUESTION =================
  const next = async () => {
    setAnswer("");
    setEvaluation("");
    setTimeLeft(60);

    if (current + 1 >= questions.length) {
      const res = await fetch(
        `http://127.0.0.1:5000/viva/result/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      setResult(data);
      setCompleted(true);

      if (data.average_score >= 8) {
        confetti({ particleCount: 200, spread: 100 });
      }
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  const resetViva = () => {
    setSessionId(null);
    setQuestions([]);
    setCurrent(0);
    setAnswer("");
    setEvaluation("");
    setResult(null);
    setCompleted(false);
    setTimeLeft(60);
  };

  const progress =
    sessionId && questions.length
      ? ((current + 1) / questions.length) * 100
      : 0;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎤 Viva Practice Mode</h2>

      {!sessionId && (
        <div style={styles.card}>
          <input
            type="text"
            placeholder="Enter Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={styles.input}
          />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={styles.input}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.input}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Marathi">Marathi</option>
            <option value="Gujarati">Gujarati</option>
          </select>

          <button style={styles.primaryBtn} onClick={startViva}>
            Start Viva
          </button>
        </div>
      )}

      {sessionId && !completed && (
        <div style={styles.card}>
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
          </div>

          <div style={styles.timer}>⏳ {timeLeft}s</div>

          <div style={styles.questionBox}>
            <h4>Question {current + 1}</h4>
            <p>{questions[current]}</p>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type or use voice..."
            style={styles.textarea}
          />

          <div style={{ display: "flex", gap: "15px" }}>
            <button style={styles.primaryBtn} onClick={submitAnswer}>
              Evaluate
            </button>

            <button
              style={{
                ...styles.micBtn,
                background: listening
                  ? "linear-gradient(90deg,#ef4444,#dc2626)"
                  : "linear-gradient(90deg,#22c55e,#16a34a)"
              }}
              onClick={listening ? stopListening : startListening}
            >
              {listening ? "🎙 Stop" : "🎤 Speak"}
            </button>
          </div>

          {evaluation && (
            <div style={styles.evaluationBox}>
              <pre style={{ whiteSpace: "pre-wrap" }}>{evaluation}</pre>
              <button style={styles.secondaryBtn} onClick={next}>
                Next Question
              </button>
            </div>
          )}
        </div>
      )}

      {completed && result && (
        <div style={styles.resultCard}>
          <h3>🎉 Viva Completed!</h3>

          <div style={styles.scoreCircle}>
            {result.average_score}
          </div>

          <p>Total Score: {result.total_score}</p>
          <p>
            Recommended Next Level:{" "}
            <strong>{result.next_recommended_difficulty}</strong>
          </p>

          <button style={styles.primaryBtn} onClick={resetViva}>
            Start New Viva
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "30px" },
  title: { color: "#38bdf8", fontSize: "26px", fontWeight: "700" },
  card: {
    background: "rgba(15,23,42,0.95)",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 0 40px rgba(56,189,248,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  input: {
    padding: "14px",
    borderRadius: "10px",
    background: "#0f172a",
    color: "white",
    border: "1px solid #334155"
  },
  textarea: {
    height: "120px",
    padding: "14px",
    borderRadius: "12px",
    background: "#0f172a",
    color: "white",
    border: "1px solid #334155"
  },
  primaryBtn: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  },
  secondaryBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#1e293b",
    color: "#38bdf8",
    cursor: "pointer"
  },
  micBtn: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  },
  questionBox: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    color: "#cbd5e1"
  },
  evaluationBox: {
    background: "#0f172a",
    padding: "20px",
    borderRadius: "12px"
  },
  progressContainer: {
    height: "8px",
    background: "#1e293b",
    borderRadius: "10px"
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    borderRadius: "10px",
    transition: "0.3s"
  },
  timer: { color: "#facc15", fontWeight: "600", textAlign: "right" },
  resultCard: {
    textAlign: "center",
    background: "rgba(15,23,42,0.95)",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 0 50px rgba(56,189,248,0.3)"
  },
  scoreCircle: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    margin: "20px auto"
  }
};

export default VivaPage;