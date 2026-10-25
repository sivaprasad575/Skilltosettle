import React, { useState, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { getWhatsAppUrl } from "@/utils/constants";
import { launchRazorpayCheckout, RazorpayPaymentSuccessResponse } from "@/utils/razorpay";
import PaymentBadges from "@/components/ui/PaymentBadges";
import {
  createEnrollmentReceipt,
  sendEnrollmentReceiptEmail,
  getWhatsAppReceiptUrl,
  getEmailReceiptMailtoUrl,
  printReceipt,
  EnrollmentReceipt,
} from "@/utils/receiptService";
import styles from "./EnrollmentCheckoutModal.module.css";

export interface EnrollmentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  price: number;
  originalPrice?: number;
  duration?: string;
  instructor?: string;
  batch?: string;
  slug?: string;
}

export default function EnrollmentCheckoutModal({
  isOpen,
  onClose,
  title,
  category = "Live Cohort Track",
  price,
  originalPrice,
  duration = "Live Interactive Cohort",
  instructor,
  batch = "Upcoming Live Batch",
  slug,
}: EnrollmentCheckoutModalProps) {
  const { formatPrice, currencyInfo } = useCurrency();
  const { user, isAuthenticated, login, logout } = useAuth();

  // Optional login state (frictionless direct checkout by default)
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Reservation & Payment form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredBatch, setPreferredBatch] = useState("Evening Batch (7:00 PM – 9:00 PM IST)");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<RazorpayPaymentSuccessResponse | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<EnrollmentReceipt | null>(null);

  // Keep student details synced with logged in profile
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (!isOpen) return null;

  const discountPercent = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 20;

  const amountInPaise = Math.round(price * 100);

  // Handle In-Modal Login (Optional for existing students)
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authEmail.trim() || !authEmail.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    if (!authPassword.trim() || authPassword.length < 4) {
      setAuthError("Password must be at least 4 characters.");
      return;
    }

    setAuthLoading(true);

    setTimeout(() => {
      setAuthLoading(false);
      const studentName = authEmail.split("@")[0];
      login(authEmail.trim(), studentName);
      setName(studentName);
      setEmail(authEmail.trim());
      setAuthError("");
      setShowLoginForm(false);
    }, 400);
  };

  // Handle Payment & Seat Reservation via Razorpay
  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || user?.name || "Student";
    const finalEmail = email.trim() || user?.email || "";

    if (!finalName || !finalEmail) {
      alert("Please ensure your student name and email are provided.");
      return;
    }

    if (!phone.trim() || phone.trim().length < 7) {
      alert("Please enter a valid WhatsApp phone number for batch onboarding.");
      return;
    }

    if (!isAuthenticated) {
      login(finalEmail, finalName);
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);

    setIsProcessing(true);

    const success = await launchRazorpayCheckout({
      amount: amountInPaise,
      currency: "INR",
      name: "SkilltoSettle",
      description: `Reserve Seat: ${title} (${batch})`,
      prefill: {
        name: finalName,
        email: finalEmail,
        contact: cleanPhone || phone,
      },
      notes: {
        courseTitle: title,
        batchTime: preferredBatch,
        learnerName: finalName,
        learnerEmail: finalEmail,
        learnerPhone: cleanPhone || phone,
        currencySelected: currencyInfo.code,
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
        },
      },
      handler: (response: RazorpayPaymentSuccessResponse) => {
        setIsProcessing(false);
        setPaymentSuccess(response);

        // Generate and dispatch receipt immediately
        const receipt = createEnrollmentReceipt({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          studentName: finalName,
          studentEmail: finalEmail,
          studentPhone: cleanPhone || phone,
          courseTitle: title,
          cohortSchedule: preferredBatch,
          amountFormatted: formatPrice(price),
          currency: currencyInfo.code,
        });
        setGeneratedReceipt(receipt);

        // Dispatch Email confirmation
        sendEnrollmentReceiptEmail(receipt);

        // Dispatch to WhatsApp
        try {
          const waUrl = getWhatsAppReceiptUrl(receipt);
          window.open(waUrl, "_blank");
        } catch (err) {
          console.warn("Could not auto-open WhatsApp link:", err);
        }
      },
    });

    if (!success) {
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setPaymentSuccess(null);
    setGeneratedReceipt(null);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleResetAndClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.modalClose}
          onClick={handleResetAndClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header (Always Visible) */}
        <div className={styles.modalHeader}>
          <div className={styles.modalEyebrowRow}>
            <span className={styles.modalCategory}>{category}</span>
            <span className={styles.modalCohortPill}>Cohort: {batch}</span>
          </div>
          <h3 className={styles.modalTitle}>{title}</h3>
          <div className={styles.modalPriceSummary}>
            <div className={styles.modalPriceLeft}>
              <span className={styles.modalPriceLabel}>Fee:</span>
              <span className={styles.modalPriceVal}>{formatPrice(price)}</span>
              {originalPrice && (
                <span className={styles.modalPriceOriginal}>{formatPrice(originalPrice)}</span>
              )}
            </div>
            <span className={styles.modalDiscountBadge}>{discountPercent}% OFF Early Bird</span>
          </div>
        </div>

        {paymentSuccess ? (
          /* Payment Success & Dual Dispatch (Mail & WhatsApp) Receipt */
          <div className={styles.enrolledSuccess}>
            <div className={styles.successIconBadge}>✓</div>
            <h3 className={styles.modalTitle}>Payment Verified & Seat Reserved!</h3>
            <p className={styles.modalNote}>
              Congratulations <strong>{name || user?.name}</strong>! Your seat in <strong>{title}</strong> is officially reserved.
            </p>

            {/* Email & WhatsApp Automated Dispatch Status Notification Card */}
            <div className={styles.dispatchAlert}>
              <div className={styles.dispatchItem}>
                <span style={{ fontSize: "1.2rem" }}>📧</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#0369a1" }}>
                    Official Receipt Dispatched to Email
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                    Dispatched to <strong>{email || user?.email}</strong> &amp; <strong>admissions@skilltosettle.com</strong> (Invoice #{generatedReceipt?.receiptNo || "STS-REC"})
                  </div>
                </div>
              </div>
              <div className={styles.dispatchItem}>
                <span style={{ fontSize: "1.2rem" }}>💬</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#166534" }}>
                    Official Receipt Dispatched to WhatsApp
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                    Delivered to WhatsApp <strong>{phone}</strong> &amp; Houston Admissions Desk
                  </div>
                </div>
              </div>
            </div>

            {/* Official Structured Receipt Card */}
            <div className={styles.receiptCard}>
              {generatedReceipt && (
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Receipt Number:</span>
                  <span className={styles.receiptPaymentId}>{generatedReceipt.receiptNo}</span>
                </div>
              )}
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Razorpay Payment ID:</span>
                <span className={styles.receiptPaymentId}>{paymentSuccess.razorpay_payment_id}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Program:</span>
                <span className={styles.receiptVal}>{title}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Cohort Schedule:</span>
                <span className={styles.receiptVal}>{preferredBatch || batch}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Amount Paid:</span>
                <span className={styles.receiptVal} style={{ color: "#0284c7" }}>
                  {generatedReceipt ? generatedReceipt.amountPaid : formatPrice(price)}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Placement Guarantee:</span>
                <span className={styles.receiptVal} style={{ color: "#166534" }}>
                  🎯 100% Placement Assistance (India &amp; USA)
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Certificate:</span>
                <span className={styles.receiptVal} style={{ color: "#166534" }}>
                  🎓 Verified Course Completion Certificate Included
                </span>
              </div>
            </div>

            {/* Primary Instant Action Buttons for WhatsApp, Email & Print PDF */}
            <div className={styles.actionButtonsGrid}>
              {generatedReceipt && (
                <a
                  href={getWhatsAppReceiptUrl(generatedReceipt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappReceiptBtn}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.203.043.072.043.419-.101.824z" />
                  </svg>
                  <span>Open Official Receipt on WhatsApp</span>
                </a>
              )}

              <div className={styles.secondaryActionsRow}>
                {generatedReceipt && (
                  <a
                    href={getEmailReceiptMailtoUrl(generatedReceipt)}
                    className={styles.emailReceiptBtn}
                    title="Send or view in your email client"
                  >
                    <span>✉️</span>
                    <span>Open / Resend via Mail</span>
                  </a>
                )}
                {generatedReceipt && (
                  <button
                    type="button"
                    onClick={() => printReceipt(generatedReceipt)}
                    className={styles.printReceiptBtn}
                    title="Download receipt as PDF or print"
                  >
                    <span>🖨️</span>
                    <span>Download PDF / Print</span>
                  </button>
                )}
              </div>
            </div>

            {/* Forward Receipt to Alternate WhatsApp Number */}
            {generatedReceipt && (
              <div style={{
                background: "var(--bg-muted, #f8fafc)",
                border: "1px dashed var(--border-color, #cbd5e1)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginTop: "12px",
                fontSize: "0.82rem",
                textAlign: "left"
              }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary, #0f172a)", marginBottom: "4px" }}>
                  📲 Need to forward this receipt to another WhatsApp number?
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="tel"
                    placeholder="Enter phone number (e.g. +91 ...)"
                    id="altWaPhone"
                    defaultValue=""
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.8rem",
                      background: "var(--bg-card, #ffffff)",
                      color: "var(--text-primary, #0f172a)"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("altWaPhone") as HTMLInputElement;
                      const customNum = input?.value?.trim();
                      if (!customNum) {
                        alert("Please enter a phone number.");
                        return;
                      }
                      window.open(getWhatsAppReceiptUrl(generatedReceipt, customNum), "_blank");
                    }}
                    style={{
                      background: "#25d366",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer"
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleResetAndClose}
              className="btn btn-outline w-full mt-md btn-sm"
              style={{ marginTop: "16px" }}
            >
              Done &amp; Return to Course
            </button>
          </div>
        ) : showLoginForm ? (
          /* OPTIONAL: Student Account Login (if user wants to log in with password) */
          <form onSubmit={handleAuthSubmit} className={styles.modalBody}>
            <div className={styles.authBanner}>
              <span>🔑</span>
              <div>
                <strong>Student Account Login</strong>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Log in to access your pre-filled learner profile and certificates.
                </div>
              </div>
            </div>

            {authError && <div className={styles.authAlertError}>{authError}</div>}

            <div className={styles.formItem}>
              <label className={styles.fieldLabel} htmlFor="authEmail">
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.fieldIcon}>✉️</span>
                <input
                  id="authEmail"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className={styles.modalInput}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formItem}>
              <label className={styles.fieldLabel} htmlFor="authPassword">
                Password
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.fieldIcon}>🔒</span>
                <input
                  id="authPassword"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className={styles.modalInput}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.authSubmitBtn}
              disabled={authLoading}
            >
              {authLoading ? "Logging In..." : "Log In & Continue →"}
            </button>

            <div className={styles.authSwitchPrompt} style={{ marginTop: "16px", textAlign: "center" }}>
              <button
                type="button"
                className={styles.authSwitchLink}
                onClick={() => {
                  setShowLoginForm(false);
                  setAuthError("");
                }}
                style={{ fontWeight: 600 }}
              >
                ← Return to Fast Checkout (No Password Needed)
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: Instant / Frictionless Checkout Form */
          <form onSubmit={handleRazorpayPayment} className={styles.modalBody}>
            {isAuthenticated && user ? (
              /* Student Logged In Status Badge */
              <div className={styles.loggedInBadge}>
                <div className={styles.loggedInInfo}>
                  <span className={styles.loggedInAvatar}>👤</span>
                  <div>
                    <div className={styles.loggedInName}>{user?.name}</div>
                    <div className={styles.loggedInEmail}>{user?.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className={styles.switchAccountBtn}
                  title="Switch to another account"
                >
                  Switch Account
                </button>
              </div>
            ) : (
              /* Guest / Fast Checkout Header Banner & Account Switcher */
              <div style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)",
                border: "1px solid #a7f3d0",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.82rem"
              }}>
                <div style={{ color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚡</span>
                  <span>Instant Seat Booking · No Password Required</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginForm(true);
                    setAuthError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0284c7",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "0.8rem",
                    padding: 0
                  }}
                >
                  Have an account? Log In
                </button>
              </div>
            )}

            {/* If not logged in, collect Student Name & Email directly */}
            {!isAuthenticated && (
              <>
                <div className={styles.formItem}>
                  <label className={styles.fieldLabel} htmlFor="checkoutName">
                    Full Name (For Course Completion Certificate)
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.fieldIcon}>👤</span>
                    <input
                      id="checkoutName"
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      className={styles.modalInput}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.fieldLabel} htmlFor="checkoutEmail">
                    Email Address (For Batch Access &amp; Official Receipt)
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.fieldIcon}>✉️</span>
                    <input
                      id="checkoutEmail"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className={styles.modalInput}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.formItem}>
              <label className={styles.fieldLabel} htmlFor="checkoutPhone">
                WhatsApp Phone Number (For Cohort Updates)
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.fieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <input
                  id="checkoutPhone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className={styles.modalInput}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formItem}>
              <label className={styles.fieldLabel} htmlFor="checkoutTiming">
                Preferred Cohort Schedule
              </label>
              <div className={styles.inputWrapper}>
                <select
                  id="checkoutTiming"
                  className={styles.modalInput}
                  style={{ background: "transparent", cursor: "pointer" }}
                  value={preferredBatch}
                  onChange={(e) => setPreferredBatch(e.target.value)}
                >
                  <option value="Evening Batch (7:00 PM – 9:00 PM IST)">
                    Evening Batch (7:00 PM – 9:00 PM IST) — Live
                  </option>
                  <option value="Weekend Fast-Track (10:00 AM – 2:00 PM IST)">
                    Weekend Fast-Track (10:00 AM – 2:00 PM IST) — Live
                  </option>
                  <option value="Morning Batch (7:30 AM – 9:00 AM IST)">
                    Morning Batch (7:30 AM – 9:00 AM IST) — Live
                  </option>
                </select>
              </div>
            </div>


            {/* Payment Options Overview Box */}
            <div className={styles.paymentOptionsBox}>
              <span className={styles.paymentOptionsTitle}>Payment Methods Accepted:</span>
              <div className={styles.paymentMethodsList}>
                <span className={styles.paymentMethodPill}>⚡ UPI (GPay / PhonePe / Paytm)</span>
                <span className={styles.paymentMethodPill}>💳 Credit / Debit Cards</span>
                <span className={styles.paymentMethodPill}>🏦 NetBanking (50+ Banks)</span>
                <span className={styles.paymentMethodPill}>💵 No-Cost EMI</span>
              </div>
            </div>

            {/* Pay & Reserve Seat Button */}
            <button
              type="submit"
              className={styles.razorpayPayBtn}
              disabled={isProcessing}
            >
              <svg
                className={styles.razorpayIconSvg}
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.8 1.5L4.5 13.2h6.1L8.2 22.5l10.8-13h-6.2l3.8-8z" fill="#ffffff"/>
              </svg>
              <span>
                {isProcessing
                  ? "Opening Payment Gateway..."
                  : `Pay ${formatPrice(price)} & Reserve My Seat`}
              </span>
              <span>→</span>
            </button>

            <div className={styles.modalPaymentsWrapper}>
              <PaymentBadges layout="compact" showLabel={false} />
            </div>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <a
                href={getWhatsAppUrl(`Hi SkilltoSettle Team! I am interested in enrolling for "${title}" (${preferredBatch || batch}). Please assist me with payment / direct UPI options.`)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  color: "#166534",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: "#f0fdf4",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #bbf7d0"
                }}
              >
                <span>💬</span>
                <span>Prefer Direct UPI / NetBanking? Chat on WhatsApp</span>
              </a>
            </div>

            <p className={styles.secureText}>
              🔒 256-Bit SSL Encrypted · Instant Seat Confirmation · 7-Day Refund Policy
            </p>
            <p style={{ textAlign: "center", fontSize: "0.74rem", color: "var(--text-secondary, #64748b)", marginTop: "6px", lineHeight: "1.4" }}>
              By reserving, you agree to our{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "underline" }}>Terms</a>,{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "underline" }}>Privacy Policy</a>, &amp;{" "}
              <a href="/refund" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "underline" }}>Refund Policy</a>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
