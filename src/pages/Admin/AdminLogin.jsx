import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Clear any stale token so the interceptor in Dashboard doesn't interfere
  useEffect(() => {
    localStorage.removeItem("admin_token");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use a fresh axios instance with no interceptors
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await axios.create().post(`${API_BASE}/api/auth/login`, { password });
      localStorage.setItem("admin_token", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="login-card">
        <div className="login-icon">
          <FaLock />
        </div>

        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Enter your password to access the dashboard</p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="input-wrap">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="admin-input"
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <p className="admin-error">{error}</p>}

          <button className="btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        <a href="/" className="back-home">← Back to portfolio</a>
      </div>
    </div>
  );
}

export default AdminLogin;
