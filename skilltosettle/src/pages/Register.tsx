import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/ui/Logo";
import styles from "./Register.module.css";

export default function Register() {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all required fields marked with *.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!agree) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = registerStudent(name.trim(), email.trim(), password.trim());
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          const target = redirectPath && redirectPath.startsWith("/student") ? redirectPath : "/student";
          navigate(target);
        }, 500);
      } else {
        setError(res.error || "Registration failed. Please try again.");
      }
    }, 450);
  };

  return (
    <div className={styles.regPage}>
      <div className={styles.regContainer}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <Logo variant="dark" size="lg" />
        </div>

        {/* Headline */}
        <div className={styles.headingBox}>
          <h1 className={styles.title}>Sign Up Details</h1>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "4px 12px", borderRadius: "999px", fontSize: "0.76rem", fontWeight: 700, marginTop: "10px", maxWidth: "100%", boxSizing: "border-box", textAlign: "center" }}>
            🎓 Course Completion Certificate Included • 100% Placement Assistance
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>Registration successful! Logging you in...</div>}

        {/* Registration Form */}
        <form onSubmit={handleRegisterSubmit} className={styles.form}>
          {/* Full Name */}
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Enter Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Phone Number */}
          <div className={styles.inputGroup}>
            <input
              type="tel"
              placeholder="Enter Phone Number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Enter Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Enter Confirm Password *"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Terms & Privacy Radio / Checkbox */}
          <div className={styles.termsRow}>
            <label className={styles.customRadio}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span className={styles.radioMark}></span>
              <span className={styles.radioLabel}>
                By signing up, you agree to{" "}
                <Link to="/terms" target="_blank" className={styles.linkText}>Terms of Service</Link> and{" "}
                <Link to="/privacy" target="_blank" className={styles.linkText}>Privacy Policy</Link>
              </span>
            </label>
          </div>

          {/* Register Button (Dark Charcoal / Black) */}
          <button
            type="submit"
            className={styles.registerBtn}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Bottom Login Link */}
        <div className={styles.loginPrompt}>
          <span>You have already an account? </span>
          <Link
            to={redirectPath && redirectPath !== "/" ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/login"}
            className={styles.loginLink}
          >
            Login
          </Link>
        </div>

        <div
          style={{
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border-light, #f1f5f9)",
            textAlign: "center",
            fontSize: "clamp(0.72rem, 3.2vw, 0.84rem)",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            whiteSpace: "nowrap",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <span>🎯</span>
          <span style={{ whiteSpace: "nowrap" }}>
            <strong>100% Placement Assistance</strong> • India &amp; USA
          </span>
        </div>
      </div>
    </div>
  );
}
