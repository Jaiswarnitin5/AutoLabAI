import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const validate = () => {
    let valid = true;

    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        alert(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      navigate(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      setLoading(false);
      alert("Server error. Make sure backend is running.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orb1}></div>
      <div style={styles.orb2}></div>

      <div style={styles.card}>
        <h2 style={styles.title}>AutoLaB AI</h2>
        <p style={styles.subtitle}>Welcome back 👋</p>

        {/* EMAIL */}
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              ...styles.input,
              ...(emailError && styles.inputError)
            }}
          />
          <label style={email ? styles.labelActive : styles.label}>
            Email Address
          </label>

          {emailError && (
            <div style={styles.errorText}>{emailError}</div>
          )}
        </div>

        {/* PASSWORD */}
        <div style={styles.inputGroup}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              ...styles.input,
              ...(passwordError && styles.inputError)
            }}
          />
          <label style={password ? styles.labelActive : styles.label}>
            Password
          </label>

          <span
            style={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </span>

          {passwordError && (
            <div style={styles.errorText}>{passwordError}</div>
          )}
        </div>

        {/* CENTERED PREMIUM BUTTON */}
        <div style={styles.buttonWrapper}>
          <button
            style={styles.button}
            onClick={handleLogin}
            onMouseEnter={(e) =>
              (e.target.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.target.style.transform = "translateY(0px)")
            }
            onMouseDown={(e) =>
              (e.target.style.transform = "translateY(1px)")
            }
            onMouseUp={(e) =>
              (e.target.style.transform = "translateY(-2px)")
            }
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <div style={styles.divider}>
          <span>or continue with</span>
        </div>

        <div style={styles.googleWrapper}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const res = await fetch("http://127.0.0.1:5000/google-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token: credentialResponse.credential
                })
              });

              const data = await res.json();

              if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                window.location.href = "/dashboard";
              }
            }}
          />
        </div>

        <p style={styles.registerText}>
          Don’t have an account?{" "}
          <span
            style={styles.registerLink}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(-45deg, #0f172a, #1e3a8a, #0f172a, #1e40af)",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden"
  },

  orb1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "rgba(59,130,246,0.3)",
    filter: "blur(120px)",
    borderRadius: "50%",
    top: "-100px",
    left: "-100px"
  },

  orb2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "rgba(6,182,212,0.3)",
    filter: "blur(120px)",
    borderRadius: "50%",
    bottom: "-80px",
    right: "-80px"
  },

  card: {
    width: "420px",
    padding: "60px 50px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(35px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 25px 70px rgba(0,0,0,0.5)",
    color: "white",
    zIndex: 10
  },

  title: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px"
  },

  subtitle: {
    textAlign: "center",
    fontSize: "14px",
    marginBottom: "45px",
    color: "#94a3b8"
  },

  inputGroup: {
    position: "relative",
    marginBottom: "28px"
  },

  input: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    transition: "0.3s"
  },

  inputError: {
    border: "1px solid #ef4444",
    boxShadow: "0 0 10px rgba(239,68,68,0.4)"
  },

  errorText: {
    color: "#f87171",
    fontSize: "12px",
    marginTop: "6px"
  },

  label: {
    position: "absolute",
    left: "18px",
    top: "18px",
    color: "#94a3b8",
    fontSize: "14px",
    transition: "0.3s"
  },

  labelActive: {
    position: "absolute",
    left: "16px",
    top: "-8px",
    fontSize: "11px",
    background: "#0f172a",
    padding: "0 6px",
    borderRadius: "6px",
    color: "#38bdf8"
  },

  eye: {
    position: "absolute",
    right: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer"
  },

  buttonWrapper: {
  display: "flex",
  justifyContent: "center",
  marginTop: "15px",
  marginBottom: "20px"
},

button: {
  width: "85%",
  padding: "18px",
  borderRadius: "22px",
  border: "none",
  background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
  color: "white",
  fontWeight: "600",
  fontSize: "16px",
  letterSpacing: "0.4px",
  cursor: "pointer",
  boxShadow: "0 18px 45px rgba(59,130,246,0.55)",
  transition: "all 0.25s ease"
},

  divider: {
    textAlign: "center",
    margin: "30px 0",
    fontSize: "13px",
    color: "#64748b"
  },

  googleWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "25px"
  },

  registerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#94a3b8"
  },

  registerLink: {
    color: "#38bdf8",
    cursor: "pointer",
    fontWeight: "500"
  }
};

export default Login;