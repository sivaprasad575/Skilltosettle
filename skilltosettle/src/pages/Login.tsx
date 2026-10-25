import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/ui/Logo";
import styles from "./Login.module.css";

export default function Login() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const redirectPath = searchParams.get("redirect") || "/";

  // Determine initial role from URL path or query parameter
  const roleParam = searchParams.get("role");
  const isPathAdmin = location.pathname.startsWith("/admin");
  const isInitiallyAdmin = isPathAdmin || roleParam === "admin";

  const [activeRole, setActiveRole] = useState<"Student" | "Admin">(
    isInitiallyAdmin ? "Admin" : "Student"
  );

  // Sync role whenever route path or search query changes
  useEffect(() => {
    const currentRole = searchParams.get("role");
    if (location.pathname.startsWith("/admin") || currentRole === "admin") {
      setActiveRole("Admin");
    } else {
      setActiveRole("Student");
    }
    setError("");
    setEmail("");
    setPassword("");
  }, [location.pathname, location.search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forceLogin, setForceLogin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = loginWithCredentials(email, password, activeRole);
      setLoading(false);

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (activeRole === "Admin") {
            const target = redirectPath && redirectPath.startsWith("/admin") ? redirectPath : "/admin";
            navigate(target);
          } else {
            const target = redirectPath && redirectPath.startsWith("/student") ? redirectPath : "/student";
            navigate(target);
          }
        }, 450);
      } else {
        setError(res.error || "Invalid credentials. Please try again.");
      }
    }, 450);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail.trim()) {
      setForgotSent(true);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <Logo variant="dark" size="lg" />
        </div>

        {/* Headline & Dedicated Role Badge */}
        <div className={styles.headingBox}>
          {activeRole === "Admin" ? (
            <>
              <div className={styles.roleBadgeAdmin}>
                <span>🛡️</span>
                <span>Administrator Portal Access</span>
              </div>
              <h1 className={styles.title}>Administrator Portal</h1>
              <h2 className={styles.subtitle} style={{ color: "#7c3aed" }}>
                Secure Access Desk
              </h2>
              <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                Authorized access only: generate accredited certificates and manage student records.
              </p>
            </>
          ) : (
            <>
              <div className={styles.roleBadgeStudent}>
                <span>🎓</span>
                <span>Student Learning Desk</span>
              </div>
              <h1 className={styles.title}>Welcome back. Please login</h1>
              <h2 className={styles.subtitle}>to your learner account</h2>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #fde68a",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  marginTop: "10px",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                🎓 Course Completion Certificate Included • 100% Placement Assistance
              </div>
            </>
          )}
        </div>


        {/* Feedback Messages */}
        {error && (
          <div className={styles.errorAlert}>
            <div>{error}</div>
            {(error.toLowerCase().includes("register") || error.toLowerCase().includes("no account")) && (
              <Link
                to={
                  redirectPath && redirectPath !== "/"
                    ? `/register?redirect=${encodeURIComponent(redirectPath)}`
                    : "/register"
                }
                className={styles.errorRegisterBtn}
              >
                Register as New Student Now →
              </Link>
            )}
          </div>
        )}
        {success && (
          <div className={styles.successAlert}>
            ✓ {activeRole === "Admin" ? "Admin authenticated! Opening portal..." : "Login successful! Redirecting..."}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className={styles.form}>
          {/* Email field */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </span>
            <input
              type="email"
              placeholder={activeRole === "Admin" ? "Admin Email" : "Student Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Password field */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          {/* Controls row: Remember Me, Forgot Password */}
          <div className={styles.optionsRow}>
            <div className={styles.checkboxGroup}>
              <label className={styles.customRadio}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className={styles.radioMark}></span>
                <span className={styles.radioLabel}>Remember Me</span>
              </label>
            </div>

            <button
              type="button"
              className={styles.forgotBtn}
              onClick={() => {
                setShowForgotModal(true);
                setForgotSent(false);
              }}
            >
              Forgot Password ?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            style={
              activeRole === "Admin"
                ? {
                    background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                    boxShadow: "0 6px 18px rgba(124, 58, 237, 0.3)",
                  }
                : undefined
            }
          >
            {loading ? "Verifying credentials..." : activeRole === "Admin" ? "Sign In to Admin Portal →" : "Login as Student"}
          </button>
        </form>

        {/* Student Register Prominent Callout Card */}
        {activeRole === "Student" ? (
          <>
            <div className={styles.studentRegisterCard}>
              <div className={styles.studentRegisterHeader}>
                <span className={styles.studentRegisterIcon}>🎓</span>
                <div>
                  <div className={styles.studentRegisterTitle}>New to SkilltoSettle?</div>
                  <div className={styles.studentRegisterSub}>
                    Don't have an account? Register as a new student to access enrolled cohorts and certificates.
                  </div>
                </div>
              </div>
              <Link
                to={
                  redirectPath && redirectPath !== "/"
                    ? `/register?redirect=${encodeURIComponent(redirectPath)}`
                    : "/register"
                }
                className={styles.studentRegisterCta}
              >
                Register as New Student →
              </Link>
            </div>

            <div style={{ marginTop: "14px", textAlign: "center", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Are you an Administrator?{" "}
              <Link to="/login?role=admin" style={{ color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>
                Admin Portal Sign In →
              </Link>
            </div>
          </>
        ) : (
          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
            Looking for Student Learning Desk?{" "}
            <Link to="/login?role=student" style={{ color: "#0284c7", fontWeight: 700, textDecoration: "none" }}>
              Go to Student Login →
            </Link>
          </div>
        )}

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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className={styles.modalOverlay} onClick={() => setShowForgotModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowForgotModal(false)}>
              ✕
            </button>
            <h3 className={styles.modalTitle}>
              {activeRole === "Admin" ? "Reset Admin Access" : "Reset Password"}
            </h3>
            <p className={styles.modalSub}>
              {activeRole === "Admin"
                ? "Enter your registered administrator email below to receive secure access recovery instructions or contact the system administrator."
                : "Enter your registered email address and we will send you a password reset link."}
            </p>

            {forgotSent ? (
              <div className={styles.forgotSuccess}>
                ✓ Password reset instructions sent to <strong>{forgotEmail}</strong>.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className={styles.forgotForm}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={styles.input}
                  style={{ width: "100%", marginBottom: "16px" }}
                />
                <button type="submit" className={styles.submitBtn}>
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
