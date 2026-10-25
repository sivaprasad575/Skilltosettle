import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useSEO } from "@/utils/useSEO";
import {
  CertificateRecord,
  getAllCertificates,
  saveCertificate,
  getNextCredentialId,
} from "@/data/certificates";
import {
  CourseSale,
  getAllSales,
  saveSale,
  updateSaleStatus,
  deleteSale,
  getSalesAnalytics,
  exportSalesToCsv,
  getNextOrderId,
} from "@/data/sales";
import { courses } from "@/data/courses";
import { instructors } from "@/data/instructors";
import CertificateDocument from "@/components/certificate/CertificateDocument";
import { downloadCertificatePdf, downloadCertificateImage } from "@/utils/certificateExport";
import { printReceipt, getWhatsAppReceiptUrl, getEmailReceiptMailtoUrl, EnrollmentReceipt } from "@/utils/receiptService";
import styles from "./CertificateGenerator.module.css";

export default function CertificateGenerator() {
  useSEO({
    title: "Admin Portal — Course Sales & Verified Credentials | SkilltoSettle",
    description: "Central administration portal for real-time course sales revenue, student enrollment transactions, verifiable certificate issuance, and registry management.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "sales" | "certificates" | "students" | "settings") || "sales";
  const [activeTab, setActiveTab] = useState<"sales" | "certificates" | "students" | "settings">(initialTab);

  const {
    user,
    isAdmin,
    loginWithCredentials,
    getAdminCredentials,
    updateAdminCredentials,
    getRegisteredStudents,
    logout,
  } = useAuth();

  const { formatPrice } = useCurrency();

  // Admin Login gate states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Change Password & Credentials modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [confirmAdminPass, setConfirmAdminPass] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");

  // ==========================================
  // COURSE SALES HUB STATE
  // ==========================================
  const [salesList, setSalesList] = useState<CourseSale[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<"ALL" | "TODAY" | "MONTH">("ALL");

  // Add Manual Sale Modal State
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [newSaleName, setNewSaleName] = useState("");
  const [newSaleEmail, setNewSaleEmail] = useState("");
  const [newSalePhone, setNewSalePhone] = useState("");
  const [newSaleCourse, setNewSaleCourse] = useState(courses[0]?.title || "Cyber Security & Ethical Hacking Mastery");
  const [newSaleCohort, setNewSaleCohort] = useState("Evening Batch (7:00 PM – 9:00 PM IST)");
  const [newSaleAmount, setNewSaleAmount] = useState<number>(34999);
  const [newSalePaymentMethod, setNewSalePaymentMethod] = useState<CourseSale["paymentMethod"]>("Direct Bank Transfer");
  const [newSaleSource, setNewSaleSource] = useState<CourseSale["source"]>("Admissions Desk");
  const [newSaleNotes, setNewSaleNotes] = useState("");
  const [saleFeedbackMsg, setSaleFeedbackMsg] = useState("");

  // ==========================================
  // CERTIFICATE GENERATOR STATE
  // ==========================================
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [candidateName, setCandidateName] = useState("Rahul Verma");
  const [courseTitle, setCourseTitle] = useState("Cyber Security & Ethical Hacking Mastery");
  const [specialization, setSpecialization] = useState("Offensive Security, SOC Analysis & Threat Hunting");
  const [mentorName, setMentorName] = useState("Suresh");
  const [mentorSignature, setMentorSignature] = useState("Suresh");
  const [directorName, setDirectorName] = useState("Dr. Rajesh K., Ph.D.");
  const [directorTitle, setDirectorTitle] = useState("PROGRAM DIRECTOR");
  const [issueDate, setIssueDate] = useState("September 2026");
  const [credentialId, setCredentialId] = useState("STS-SEC-2026-8942");
  const [capstoneProject, setCapstoneProject] = useState("Multi-VPC Perimeter Defense & SIEM Incident Automation");
  const [candidateEmail, setCandidateEmail] = useState("rahul.verma@alumni.skilltosettle.com");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load data on mount & handle tab switches
  useEffect(() => {
    setSalesList(getAllSales());
    setRecords(getAllCertificates());
  }, []);

  const handleTabChange = (tab: "sales" | "certificates" | "students" | "settings") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Handle Admin Inline Login
  const handleAdminInlineLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    setTimeout(() => {
      const res = loginWithCredentials(loginEmail, loginPassword, "Admin");
      setIsLoggingIn(false);
      if (!res.success) {
        setLoginError(res.error || "Invalid administrator credentials.");
      }
    }, 400);
  };

  const handleCopyPrivateLink = (idToCopy: string) => {
    const privateUrl = `https://skilltosettle.com/certificate/${encodeURIComponent(idToCopy)}`;
    navigator.clipboard.writeText(privateUrl).then(() => {
      setCopiedId(idToCopy);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Handle Changing Admin Password / Email
  const handleSaveAdminSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    if (!newAdminEmail.trim() || !newAdminEmail.includes("@")) {
      setSettingsError("Please enter a valid administrator email address.");
      return;
    }

    if (newAdminPass) {
      if (newAdminPass.length < 6) {
        setSettingsError("New password must be at least 6 characters long.");
        return;
      }
      if (newAdminPass !== confirmAdminPass) {
        setSettingsError("New passwords do not match. Please re-type.");
        return;
      }
    }

    const res = updateAdminCredentials({
      name: newAdminName.trim() || undefined,
      email: newAdminEmail.trim(),
      password: newAdminPass ? newAdminPass.trim() : undefined,
    });

    if (res.success) {
      setSettingsSuccess("✓ " + res.message);
      setNewAdminPass("");
      setConfirmAdminPass("");
      setTimeout(() => {
        setShowSettingsModal(false);
        setSettingsSuccess("");
      }, 1600);
    } else {
      setSettingsError("Failed to update admin credentials.");
    }
  };

  // Sync course selection with mentor and specialization defaults
  const handleCourseChange = (selectedTitle: string) => {
    setCourseTitle(selectedTitle);
    const found = courses.find((c) => c.title === selectedTitle);
    if (found) {
      setMentorName(found.instructor);
      setMentorSignature(found.instructor);
      if (found.category) {
        setSpecialization(`${found.category} Specialization`);
      }
      let codePrefix = "STS-TECH";
      if (found.slug.includes("cyber")) codePrefix = "STS-SEC";
      else if (found.slug.includes("data")) codePrefix = "STS-DATA";
      else if (found.slug.includes("dsa")) codePrefix = "STS-DSA";
      else if (found.slug.includes("devops")) codePrefix = "STS-DEV";
      else if (found.slug.includes("sql")) codePrefix = "STS-SQL";
      else if (found.slug.includes("ielts")) codePrefix = "STS-ENG";
      setCredentialId(getNextCredentialId(codePrefix));
    }
  };

  // Auto-generate next continuation ID
  const handleNextId = () => {
    let prefix = "STS-SEC";
    if (credentialId.includes("-")) {
      const parts = credentialId.split("-");
      prefix = `${parts[0]}-${parts[1]}`;
    }
    setCredentialId(getNextCredentialId(prefix));
  };

  // Save Certificate to Database
  const handleSaveToDatabase = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newRecord: CertificateRecord = {
      id: credentialId.trim().toUpperCase(),
      candidateName: candidateName.trim(),
      courseTitle: courseTitle.trim(),
      specialization: specialization.trim(),
      mentorName,
      mentorSignature: mentorSignature || mentorName,
      directorName,
      directorTitle,
      issueDate: issueDate.trim(),
      status: "Verified",
      grade: "Distinction",
      capstoneProject: capstoneProject.trim() || "Advanced Industry Capstone Project",
      skills: ["Production Implementation", "Live Architecture", "Code Review Completed"],
      candidateEmail: candidateEmail.trim(),
      createdAt: new Date().toISOString(),
    };

    saveCertificate(newRecord);
    setRecords(getAllCertificates());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Download Direct Client-Side High-Res PDF
  const handleDownloadPdf = async () => {
    handleSaveToDatabase();
    setIsExportingPdf(true);
    const elementId = `cert-${credentialId.trim().toUpperCase()}`;
    await downloadCertificatePdf(elementId, candidateName, credentialId, orientation);
    setIsExportingPdf(false);
  };

  // Load a certificate record from history into editor
  const handleLoadRecord = (rec: CertificateRecord) => {
    setCandidateName(rec.candidateName);
    setCourseTitle(rec.courseTitle);
    setSpecialization(rec.specialization);
    setMentorName(rec.mentorName);
    setMentorSignature(rec.mentorSignature);
    setDirectorName(rec.directorName);
    setDirectorTitle(rec.directorTitle);
    setIssueDate(rec.issueDate);
    setCredentialId(rec.id);
    setCapstoneProject(rec.capstoneProject || "");
    setCandidateEmail(rec.candidateEmail || "");
    handleTabChange("certificates");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================
  // 1-CLICK ISSUE CERTIFICATE FROM SALES RECORD
  // ==========================================
  const handleIssueCertFromSale = (sale: CourseSale) => {
    setCandidateName(sale.studentName);
    setCandidateEmail(sale.studentEmail);
    handleCourseChange(sale.courseTitle);
    setIssueDate(new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }));
    setCapstoneProject(`Industry Capstone — ${sale.courseTitle}`);
    handleTabChange("certificates");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================
  // ADD MANUAL COURSE SALE HANDLER
  // ==========================================
  const handleCreateManualSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaleName.trim() || !newSaleEmail.trim()) {
      alert("Please provide the student's name and email.");
      return;
    }

    const orderId = getNextOrderId();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const targetCourse = courses.find((c) => c.title === newSaleCourse);

    const newSaleItem: CourseSale = {
      id: orderId,
      receiptNo: `STS-REC-${randomSuffix}`,
      paymentId: `manual_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      studentName: newSaleName.trim(),
      studentEmail: newSaleEmail.trim(),
      studentPhone: newSalePhone.trim() || "+91 98000 00000",
      courseTitle: newSaleCourse,
      courseSlug: targetCourse?.slug || "tech-course",
      category: targetCourse?.category || "Live Cohort",
      cohortSchedule: newSaleCohort,
      amount: Number(newSaleAmount) || 34999,
      currency: "INR",
      paymentMethod: newSalePaymentMethod,
      paymentStatus: "Paid & Verified",
      date: now.toISOString(),
      dateFormatted: dateStr,
      source: newSaleSource,
      notes: newSaleNotes.trim() || "Manual offline/counselor enrollment",
    };

    saveSale(newSaleItem);
    setSalesList(getAllSales());
    setSaleFeedbackMsg("✓ Course enrollment sale recorded successfully!");
    setTimeout(() => {
      setShowAddSaleModal(false);
      setSaleFeedbackMsg("");
      setNewSaleName("");
      setNewSaleEmail("");
      setNewSalePhone("");
      setNewSaleNotes("");
    }, 1200);
  };

  // Toggle order status (Paid / Refunded)
  const handleToggleOrderStatus = (sale: CourseSale) => {
    const nextStatus = sale.paymentStatus === "Paid & Verified" ? "Refunded" : "Paid & Verified";
    const confirmChange = window.confirm(`Update order ${sale.id} status to "${nextStatus}"?`);
    if (confirmChange) {
      updateSaleStatus(sale.id, nextStatus);
      setSalesList(getAllSales());
    }
  };

  // Print receipt for a sale record
  const handlePrintSaleReceipt = (sale: CourseSale) => {
    const receipt: EnrollmentReceipt = {
      receiptNo: sale.receiptNo,
      paymentId: sale.paymentId,
      orderId: sale.orderId || sale.id,
      date: sale.dateFormatted,
      studentName: sale.studentName,
      studentEmail: sale.studentEmail,
      studentPhone: sale.studentPhone,
      courseTitle: sale.courseTitle,
      cohortSchedule: sale.cohortSchedule,
      amountPaid: formatPrice(sale.amount),
      currency: sale.currency,
      status: sale.paymentStatus === "Paid & Verified" ? "PAID & VERIFIED" : "PENDING",
      assistanceGuarantee: "100% Placement Assistance (India & USA Network)",
      certificateGuarantee: "Verified Course Completion Certificate Included",
    };
    printReceipt(receipt);
  };

  // WhatsApp receipt for a sale record
  const handleWhatsAppSaleReceipt = (sale: CourseSale) => {
    const receipt: EnrollmentReceipt = {
      receiptNo: sale.receiptNo,
      paymentId: sale.paymentId,
      orderId: sale.orderId || sale.id,
      date: sale.dateFormatted,
      studentName: sale.studentName,
      studentEmail: sale.studentEmail,
      studentPhone: sale.studentPhone,
      courseTitle: sale.courseTitle,
      cohortSchedule: sale.cohortSchedule,
      amountPaid: formatPrice(sale.amount),
      currency: sale.currency,
      status: "PAID & VERIFIED",
      assistanceGuarantee: "100% Placement Assistance (India & USA Network)",
      certificateGuarantee: "Verified Course Completion Certificate Included",
    };
    const waUrl = getWhatsAppReceiptUrl(receipt, sale.studentPhone);
    window.open(waUrl, "_blank");
  };

  // Email receipt for a sale record
  const handleEmailSaleReceipt = (sale: CourseSale) => {
    const receipt: EnrollmentReceipt = {
      receiptNo: sale.receiptNo,
      paymentId: sale.paymentId,
      orderId: sale.orderId || sale.id,
      date: sale.dateFormatted,
      studentName: sale.studentName,
      studentEmail: sale.studentEmail,
      studentPhone: sale.studentPhone,
      courseTitle: sale.courseTitle,
      cohortSchedule: sale.cohortSchedule,
      amountPaid: formatPrice(sale.amount),
      currency: sale.currency,
      status: "PAID & VERIFIED",
      assistanceGuarantee: "100% Placement Assistance (India & USA Network)",
      certificateGuarantee: "Verified Course Completion Certificate Included",
    };
    window.location.href = getEmailReceiptMailtoUrl(receipt);
  };

  // Filtered sales calculation
  const filteredSales = salesList.filter((s) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        s.studentName.toLowerCase().includes(q) ||
        s.studentEmail.toLowerCase().includes(q) ||
        s.studentPhone.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.receiptNo.toLowerCase().includes(q) ||
        s.paymentId.toLowerCase().includes(q) ||
        s.courseTitle.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // Course filter
    if (selectedCourseFilter !== "ALL" && s.courseTitle !== selectedCourseFilter) {
      return false;
    }

    // Status filter
    if (selectedStatusFilter !== "ALL" && s.paymentStatus !== selectedStatusFilter) {
      return false;
    }

    // Period filter
    if (selectedPeriodFilter === "TODAY") {
      const todayStr = new Date().toISOString().split("T")[0];
      if (!s.date.startsWith(todayStr)) return false;
    } else if (selectedPeriodFilter === "MONTH") {
      const now = new Date();
      const saleDate = new Date(s.date);
      if (saleDate.getMonth() !== now.getMonth() || saleDate.getFullYear() !== now.getFullYear()) {
        return false;
      }
    }

    return true;
  });

  const salesAnalytics = getSalesAnalytics();
  const registeredStudents = getRegisteredStudents();

  const currentPreviewRecord: CertificateRecord = {
    id: credentialId.trim().toUpperCase(),
    candidateName: candidateName.trim() || "Rahul Verma",
    courseTitle: courseTitle.trim() || "Course Title",
    specialization: specialization.trim(),
    mentorName,
    mentorSignature: mentorSignature || mentorName,
    directorName,
    directorTitle,
    issueDate: issueDate.trim() || "September 2026",
    status: "Verified",
    capstoneProject,
    skills: ["SOC Operations", "Penetration Testing", "Security Architecture", "Cloud Defense"],
    createdAt: new Date().toISOString(),
  };

  // Guard: If not logged in as Admin, show Admin Authentication Screen
  if (!isAdmin) {
    return (
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.adminLockWrapper}>
            <div className={styles.lockIcon}>🛡️</div>
            <h2 className={styles.lockTitle}>Administrator Portal Sign In</h2>
            <p className={styles.lockSubtitle}>
              Restricted area. Please authenticate with administrator credentials to manage course sales, revenue analytics, and student credentials.
            </p>

            {loginError && (
              <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px", textAlign: "left", fontWeight: 600 }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminInlineLogin} style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter admin email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Admin Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.9rem" }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", marginTop: "6px", boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)" }}
              >
                {isLoggingIn ? "Authenticating..." : "Unlock Admin Workspace →"}
              </button>
            </form>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "0.82rem" }}>
              <Link to="/" style={{ color: "var(--color-primary, #0284c7)", textDecoration: "none" }}>← Back to Website</Link>
              <span style={{ color: "var(--border-color)" }}>•</span>
              <Link to="/student" style={{ color: "#0284c7", fontWeight: 700, textDecoration: "none" }}>🎓 Student Login (/student)</Link>
              <span style={{ color: "var(--border-color)" }}>•</span>
              <Link to="/register" style={{ color: "#0284c7", fontWeight: 700, textDecoration: "none" }}>Register as Student</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        {/* Page Header */}
        <div className={`${styles.headerSection} no-print`}>
          <div className={styles.topNavRow}>
            <div style={{ color: "var(--text-secondary)" }}>
              <Link to="/" style={{ color: "var(--color-primary, #0284c7)", textDecoration: "none" }}>Home</Link>
              <span style={{ margin: "0 8px" }}>/</span>
              <span>Master Administrator Portal</span>
            </div>
            <div className={styles.topActionsGroup}>
              <button
                type="button"
                onClick={() => {
                  const creds = getAdminCredentials();
                  setNewAdminName(creds.name);
                  setNewAdminEmail(creds.email);
                  setShowSettingsModal(true);
                }}
                className={styles.adminTopBtn}
              >
                ⚙️ Admin Settings
              </button>
              <Link to="/verify" target="_blank" style={{ color: "var(--color-primary, #0284c7)", textDecoration: "none", fontWeight: 700, fontSize: "0.82rem" }}>
                🔍 Verify Portal →
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className={styles.adminLogoutBtn}
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className={styles.badge}>
            <span>🛡️ OFFICIAL SKILLTOSETTLE MANAGEMENT DESK</span>
          </div>
          <h1 className={styles.title}>Admin Operations &amp; Course Sales Hub</h1>
          <p className={styles.subtitle}>
            Manage real-time course sales revenue, student enrollments, transaction receipts, verifiable course completion certificates, and graduate credential databases.
          </p>
        </div>

        {/* Unified Top Navigation Tabs */}
        <div className={`${styles.adminTabsBar} no-print`}>
          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "sales" ? styles.adminTabBtnActive : ""}`}
            onClick={() => handleTabChange("sales")}
          >
            <span>📊</span>
            <span>Course Sales &amp; Revenue</span>
            <span className={activeTab === "sales" ? styles.tabBadge : styles.tabBadgeDark}>
              {salesList.length}
            </span>
          </button>

          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "certificates" ? styles.adminTabBtnActivePurple : ""}`}
            onClick={() => handleTabChange("certificates")}
          >
            <span>📜</span>
            <span>Certificates &amp; Registry</span>
            <span className={activeTab === "certificates" ? styles.tabBadge : styles.tabBadgeDark}>
              {records.length}
            </span>
          </button>

          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "students" ? styles.adminTabBtnActive : ""}`}
            onClick={() => handleTabChange("students")}
          >
            <span>👥</span>
            <span>Student Accounts</span>
            <span className={activeTab === "students" ? styles.tabBadge : styles.tabBadgeDark}>
              {registeredStudents.length}
            </span>
          </button>

          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "settings" ? styles.adminTabBtnActive : ""}`}
            onClick={() => {
              const creds = getAdminCredentials();
              setNewAdminName(creds.name);
              setNewAdminEmail(creds.email);
              setShowSettingsModal(true);
            }}
          >
            <span>🔑</span>
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: COURSE SALES & REVENUE HUB VIEW                    */}
        {/* ========================================================= */}
        {activeTab === "sales" && (
          <div className="no-print">
            {/* Sales KPI Summary Cards */}
            <div className={styles.salesKpiGrid}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiTopRow}>
                  <div className={styles.kpiIconWrap} style={{ background: "#ecfdf5", color: "#059669" }}>
                    💰
                  </div>
                  <span className={`${styles.kpiTrendBadge} ${styles.trendGreen}`}>
                    ↑ Live Revenue
                  </span>
                </div>
                <div className={styles.kpiLabel}>Total Sales Revenue</div>
                <div className={styles.kpiValue} style={{ color: "#059669" }}>
                  {formatPrice(salesAnalytics.totalRevenue)}
                </div>
                <div className={styles.kpiSubtext}>
                  This Month: <strong>{formatPrice(salesAnalytics.thisMonthRevenue)}</strong> ({salesAnalytics.thisMonthOrdersCount} orders)
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiTopRow}>
                  <div className={styles.kpiIconWrap} style={{ background: "#e0f2fe", color: "#0284c7" }}>
                    🎓
                  </div>
                  <span className={`${styles.kpiTrendBadge} ${styles.trendBlue}`}>
                    {salesAnalytics.paidOrdersCount} Paid
                  </span>
                </div>
                <div className={styles.kpiLabel}>Course Enrollments</div>
                <div className={styles.kpiValue} style={{ color: "#0284c7" }}>
                  {salesAnalytics.totalOrders}
                </div>
                <div className={styles.kpiSubtext}>
                  {salesAnalytics.refundedOrdersCount > 0 ? `${salesAnalytics.refundedOrdersCount} refunded` : "0 Refunds requested"}
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiTopRow}>
                  <div className={styles.kpiIconWrap} style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                    ⚡
                  </div>
                  <span className={`${styles.kpiTrendBadge} ${styles.trendPurple}`}>
                    Average
                  </span>
                </div>
                <div className={styles.kpiLabel}>Average Order Value (AOV)</div>
                <div className={styles.kpiValue} style={{ color: "#7c3aed" }}>
                  {formatPrice(salesAnalytics.averageOrderValue)}
                </div>
                <div className={styles.kpiSubtext}>
                  Across all live flagship cohorts
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiTopRow}>
                  <div className={styles.kpiIconWrap} style={{ background: "#fef3c7", color: "#d97706" }}>
                    🛡️
                  </div>
                  <span className={`${styles.kpiTrendBadge} ${styles.trendGreen}`}>
                    99.8% Gateway
                  </span>
                </div>
                <div className={styles.kpiLabel}>Payment Success Rate</div>
                <div className={styles.kpiValue} style={{ color: "#d97706" }}>
                  {salesAnalytics.successRatePercent}%
                </div>
                <div className={styles.kpiSubtext}>
                  Razorpay UPI, Cards &amp; NetBanking
                </div>
              </div>
            </div>

            {/* Course Performance Breakdown & Cohort Schedule Metrics */}
            <div className={styles.analyticsDualGrid}>
              <div className={styles.analyticsCard}>
                <div className={styles.cardHeaderRow}>
                  <h3 className={styles.cardTitle}>
                    <span>📈</span> Course Revenue Breakdown
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>
                    Top Performing Masterclasses
                  </span>
                </div>

                <div className={styles.courseBreakdownList}>
                  {salesAnalytics.courseBreakdown.slice(0, 5).map((cb, idx) => (
                    <div key={idx} className={styles.courseProgressItem}>
                      <div className={styles.courseProgressHeader}>
                        <div className={styles.courseProgressName}>
                          {cb.courseTitle} ({cb.ordersCount} seats)
                        </div>
                        <div className={styles.courseProgressAmount}>
                          {formatPrice(cb.revenue)} ({cb.percentageOfTotal}%)
                        </div>
                      </div>
                      <div className={styles.progressBarTrack}>
                        <div
                          className={styles.progressBarFill}
                          style={{ width: `${Math.max(cb.percentageOfTotal, 5)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.analyticsCard}>
                <div className={styles.cardHeaderRow}>
                  <h3 className={styles.cardTitle}>
                    <span>🕒</span> Cohort Time &amp; Method
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>
                    Batch Demographics
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
                      Popular Cohort Slots
                    </div>
                    {salesAnalytics.cohortBreakdown.map((ch, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", padding: "4px 0", borderBottom: "1px dashed #f1f5f9" }}>
                        <span style={{ color: "#334155" }}>{ch.schedule}</span>
                        <strong style={{ color: "#0284c7" }}>{ch.ordersCount} enrolled</strong>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "6px" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
                      Payment Methods
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {salesAnalytics.paymentMethodBreakdown.map((pm, i) => (
                        <span key={i} style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                          {pm.method}: {pm.ordersCount}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Filter & Action Toolbar */}
            <div className={styles.salesToolbarCard}>
              <div className={styles.toolbarTopRow}>
                <div>
                  <h3 className={styles.toolbarTitle}>
                    💳 Course Sales Transactions ({filteredSales.length} Records)
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                    Real-time student seat bookings, automated receipt delivery logs, and 1-click certificate dispatch.
                  </p>
                </div>

                <div className={styles.toolbarActions}>
                  <button
                    type="button"
                    onClick={() => setShowAddSaleModal(true)}
                    className={styles.addSaleBtn}
                  >
                    <span>➕</span>
                    <span>Add Offline / Counselor Sale</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportSalesToCsv(filteredSales)}
                    className={styles.exportCsvBtn}
                  >
                    <span>📥</span>
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className={styles.filterInputsGrid}>
                {/* Search */}
                <div className={styles.searchBoxWrap}>
                  <span className={styles.searchIcon}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search name, email, receipt, pay ID..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Course Filter */}
                <div>
                  <select
                    className={styles.filterSelect}
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  >
                    <option value="ALL">All Course Programs</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    className={styles.filterSelect}
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Payment Statuses</option>
                    <option value="Paid & Verified">✓ Paid &amp; Verified</option>
                    <option value="Processing">⏳ Processing</option>
                    <option value="Refunded">↩ Refunded</option>
                  </select>
                </div>

                {/* Period Filter */}
                <div>
                  <select
                    className={styles.filterSelect}
                    value={selectedPeriodFilter}
                    onChange={(e) => setSelectedPeriodFilter(e.target.value as any)}
                  >
                    <option value="ALL">All Time</option>
                    <option value="TODAY">Today's Sales</option>
                    <option value="MONTH">This Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sales Transactions: Desktop Table + Mobile Flexbox Cards */}
            <div className={styles.salesTableCard}>
              {filteredSales.length === 0 ? (
                <div style={{ textAlign: "center", padding: "36px 14px", color: "#64748b" }}>
                  No sales transactions match your current search and filter criteria.
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE VIEW (Visible > 860px) */}
                  <div className={styles.desktopTableWrap}>
                    <table className={styles.salesTable}>
                      <thead>
                        <tr>
                          <th>Order &amp; Receipt</th>
                          <th>Student Details</th>
                          <th>Course &amp; Cohort</th>
                          <th>Amount Paid</th>
                          <th>Payment Info</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSales.map((sale) => (
                          <tr key={sale.id}>
                            <td>
                              <div className={styles.orderReceiptRow}>
                                <span
                                  className={styles.orderIdPill}
                                  title="Click to copy Order ID"
                                  onClick={() => navigator.clipboard.writeText(sale.id)}
                                >
                                  {sale.id}
                                </span>
                                <span className={styles.receiptTag}>
                                  #{sale.receiptNo}
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className={styles.studentInfoCol}>
                                <strong className={styles.studentNameText}>{sale.studentName}</strong>
                                <span className={styles.studentEmailText}>{sale.studentEmail}</span>
                                <span className={styles.studentPhoneTag}>💬 {sale.studentPhone}</span>
                              </div>
                            </td>

                            <td>
                              <div className={styles.courseInfoCol}>
                                <strong className={styles.courseTitleText}>{sale.courseTitle}</strong>
                                <span className={styles.cohortScheduleText}>{sale.cohortSchedule}</span>
                                <span className={styles.sourceTag}>Source: {sale.source}</span>
                              </div>
                            </td>

                            <td>
                              <div className={styles.amountCol}>
                                <strong className={styles.amountValueText}>
                                  {formatPrice(sale.amount)}
                                </strong>
                                <span className={styles.currencyTag}>{sale.currency}</span>
                              </div>
                            </td>

                            <td>
                              <div className={styles.paymentInfoCol}>
                                <span className={styles.paymentIdCode}>
                                  {sale.paymentId}
                                </span>
                                <span className={styles.paymentMethodDate}>
                                  {sale.paymentMethod} · {sale.dateFormatted}
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className={styles.statusCellWrap}>
                                <span
                                  onClick={() => handleToggleOrderStatus(sale)}
                                  style={{ cursor: "pointer" }}
                                  title="Click to toggle status"
                                  className={
                                    sale.paymentStatus === "Paid & Verified"
                                      ? styles.statusPaid
                                      : sale.paymentStatus === "Refunded"
                                      ? styles.statusRefunded
                                      : styles.statusProcessing
                                  }
                                >
                                  <span className={styles.statusIcon}>
                                    {sale.paymentStatus === "Paid & Verified" ? "✓" : sale.paymentStatus === "Refunded" ? "↩" : "⏳"}
                                  </span>
                                  <span>{sale.paymentStatus === "Paid & Verified" ? "Paid" : sale.paymentStatus}</span>
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className={styles.actionsRow}>
                                <button
                                  type="button"
                                  onClick={() => handlePrintSaleReceipt(sale)}
                                  className={styles.actionReceiptBtn}
                                  title="Print / Download Official Receipt"
                                >
                                  🖨️ Receipt
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleWhatsAppSaleReceipt(sale)}
                                  className={styles.actionWhatsAppBtn}
                                  title="Open / Resend Receipt on WhatsApp"
                                >
                                  💬 WhatsApp
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleIssueCertFromSale(sale)}
                                  className={styles.issueCertBtn}
                                  title="1-Click Issue Verifiable Certificate"
                                >
                                  🎓 Issue Cert →
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE FLEXBOX CARDS VIEW (Visible <= 860px, All-in-One Screen, No Horizontal Scroll) */}
                  <div className={styles.mobileCardList}>
                    {filteredSales.map((sale) => (
                      <div key={sale.id} className={styles.mobileSalesCard}>
                        {/* Top Row: Order ID, Receipt No & Status Badge */}
                        <div className={styles.mCardTopRow}>
                          <div className={styles.orderReceiptRow}>
                            <span
                              className={styles.orderIdPill}
                              title="Click to copy Order ID"
                              onClick={() => navigator.clipboard.writeText(sale.id)}
                            >
                              {sale.id}
                            </span>
                            <span className={styles.receiptTag}>
                              #{sale.receiptNo}
                            </span>
                          </div>

                          <span
                            onClick={() => handleToggleOrderStatus(sale)}
                            style={{ cursor: "pointer" }}
                            title="Click to toggle status"
                            className={
                              sale.paymentStatus === "Paid & Verified"
                                ? styles.statusPaid
                                : sale.paymentStatus === "Refunded"
                                ? styles.statusRefunded
                                : styles.statusProcessing
                            }
                          >
                            <span className={styles.statusIcon}>
                              {sale.paymentStatus === "Paid & Verified" ? "✓" : sale.paymentStatus === "Refunded" ? "↩" : "⏳"}
                            </span>
                            <span>{sale.paymentStatus === "Paid & Verified" ? "Paid" : sale.paymentStatus}</span>
                          </span>
                        </div>

                        {/* Student Details & Amount Row */}
                        <div className={styles.mCardStudentRow}>
                          <div className={styles.studentInfoCol}>
                            <strong className={styles.studentNameText}>{sale.studentName}</strong>
                            <span className={styles.studentEmailText}>{sale.studentEmail}</span>
                            <span className={styles.studentPhoneTag}>💬 {sale.studentPhone}</span>
                          </div>
                          <div className={styles.mCardAmountBlock}>
                            <strong className={styles.amountValueText}>
                              {formatPrice(sale.amount)}
                            </strong>
                            <span className={styles.currencyTag}>{sale.currency}</span>
                          </div>
                        </div>

                        {/* Course & Cohort Box */}
                        <div className={styles.mCardCourseBlock}>
                          <strong className={styles.courseTitleText}>{sale.courseTitle}</strong>
                          <div className={styles.mCardCohortMeta}>
                            <span>📅 {sale.cohortSchedule}</span>
                            <span>• Source: {sale.source}</span>
                          </div>
                        </div>

                        {/* Payment Method & Timestamp */}
                        <div className={styles.mCardPaymentRow}>
                          <span className={styles.paymentIdCode}>{sale.paymentId}</span>
                          <span className={styles.paymentMethodDate}>{sale.paymentMethod} · {sale.dateFormatted}</span>
                        </div>

                        {/* Action Buttons in single full-width flex row */}
                        <div className={styles.mCardActionsRow}>
                          <button
                            type="button"
                            onClick={() => handlePrintSaleReceipt(sale)}
                            className={styles.actionReceiptBtn}
                          >
                            🖨️ Receipt
                          </button>

                          <button
                            type="button"
                            onClick={() => handleWhatsAppSaleReceipt(sale)}
                            className={styles.actionWhatsAppBtn}
                          >
                            💬 WhatsApp
                          </button>

                          <button
                            type="button"
                            onClick={() => handleIssueCertFromSale(sale)}
                            className={styles.issueCertBtn}
                          >
                            🎓 Issue Cert →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CERTIFICATE GENERATOR & REGISTRY VIEW              */}
        {/* ========================================================= */}
        {activeTab === "certificates" && (
          <div>
            {/* Main Grid: Form Left, Preview Right */}
            <div className={styles.mainGrid}>
              {/* Left Column: Editor Controls */}
              <div className={`${styles.formCard} no-print`}>
                <div className={styles.formCardTitle}>
                  <span>⚙️ Certificate Details</span>
                  <button
                    type="button"
                    onClick={handleNextId}
                    className={styles.autoIdBtn}
                    title="Generate next sequential Credential ID"
                  >
                    ⚡ Next ID
                  </button>
                </div>

                <form onSubmit={handleSaveToDatabase}>
                  {/* Candidate Name */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Candidate Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      className={styles.formInput}
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                    />
                  </div>

                  {/* Course Title Selection */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Course Program *</label>
                    <select
                      className={styles.formSelect}
                      value={courseTitle}
                      onChange={(e) => handleCourseChange(e.target.value)}
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                      <option value="Cyber Security & Ethical Hacking Masterclass">
                        Cyber Security &amp; Ethical Hacking Masterclass (Official)
                      </option>
                    </select>
                  </div>

                  {/* Specialization Pill Text */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Specialization Track</label>
                    <input
                      type="text"
                      placeholder="e.g. Offensive Security, SOC Analysis & Threat Hunting"
                      className={styles.formInput}
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>

                  {/* Credential ID Continuation */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Credential ID (Unique Serial) *</label>
                    <div className={styles.idContinuationRow}>
                      <input
                        type="text"
                        required
                        placeholder="e.g. STS-SEC-2026-8942"
                        className={styles.formInput}
                        value={credentialId}
                        onChange={(e) => setCredentialId(e.target.value.toUpperCase())}
                      />
                      <button
                        type="button"
                        onClick={handleNextId}
                        className={styles.autoIdBtn}
                      >
                        Auto-Next
                      </button>
                    </div>
                  </div>

                  {/* Issue Date */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Issued Date (Month &amp; Year)</label>
                    <input
                      type="text"
                      placeholder="e.g. September 2026"
                      className={styles.formInput}
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                    />
                  </div>

                  {/* Lead Mentor */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lead Technical Mentor</label>
                    <select
                      className={styles.formSelect}
                      value={mentorName}
                      onChange={(e) => {
                        setMentorName(e.target.value);
                        setMentorSignature(e.target.value);
                      }}
                    >
                      {instructors.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.title})
                        </option>
                      ))}
                      <option value="Suresh">Suresh (Lead Cyber Security Architect)</option>
                    </select>
                  </div>

                  {/* Capstone Project */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Production Capstone Project</label>
                    <input
                      type="text"
                      placeholder="e.g. Multi-VPC Perimeter Defense Architecture"
                      className={styles.formInput}
                      value={capstoneProject}
                      onChange={(e) => setCapstoneProject(e.target.value)}
                    />
                  </div>

                  {/* Optional Email */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Student Email (Optional Registry)</label>
                    <input
                      type="email"
                      placeholder="student@example.com"
                      className={styles.formInput}
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                    />
                  </div>

                  {/* Save Alert */}
                  {saveSuccess && (
                    <div className={styles.saveFeedback}>
                      <span>✓</span>
                      <span>Certificate saved to official registry successfully!</span>
                    </div>
                  )}

                  {/* Orientation Switcher */}
                  <div style={{ marginBottom: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Certificate Orientation:
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setOrientation("landscape")}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: orientation === "landscape" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                          background: orientation === "landscape" ? "#eff6ff" : "#ffffff",
                          color: orientation === "landscape" ? "#0284c7" : "#475569",
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <span>🖥️</span>
                        <span>Horizontal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrientation("portrait")}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: orientation === "portrait" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                          background: orientation === "portrait" ? "#eff6ff" : "#ffffff",
                          color: orientation === "portrait" ? "#0284c7" : "#475569",
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <span>📱</span>
                        <span>Vertical</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color, #e2e8f0)" }}>
                    <button
                      type="submit"
                      style={{ width: "100%", background: "linear-gradient(135deg, #166534 0%, #15803d 100%)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "0.95rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(22, 101, 52, 0.25)" }}
                    >
                      <span>💾</span>
                      <span>Save to Graduate Database</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={isExportingPdf}
                      style={{ width: "100%", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "0.95rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)" }}
                    >
                      <span>📄</span>
                      <span>{isExportingPdf ? "Generating PDF Document..." : "Download / Print PDF"}</span>
                    </button>

                    <Link
                      to={`/certificate/${encodeURIComponent(credentialId)}`}
                      target="_blank"
                      className={styles.verifyLinkBtn}
                    >
                      <span>🔍</span>
                      <span>View Public Verification Page →</span>
                    </Link>
                  </div>
                </form>
              </div>

              {/* Right Column: Live High-Resolution Certificate Document Preview */}
              <div className={styles.previewCol}>
                <div
                  className={`${styles.previewHeader} no-print`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", background: "#ffffff", padding: "12px 18px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>
                      📄 Live Certificate Preview
                    </span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0369a1", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "3px 10px", borderRadius: "999px" }}>
                      A4 {orientation === "landscape" ? "Horizontal" : "Vertical"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={isExportingPdf}
                      style={{ background: "linear-gradient(135deg, #166534 0%, #15803d 100%)", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 3px 10px rgba(22, 101, 52, 0.25)" }}
                    >
                      <span>📄</span>
                      <span>{isExportingPdf ? "Generating..." : "Download PDF"}</span>
                    </button>
                  </div>
                </div>

                <div className={styles.certScrollWrapper}>
                  <div className="printable-cert-root">
                    <CertificateDocument cert={currentPreviewRecord} orientation={orientation} />
                  </div>
                </div>
              </div>
            </div>

            {/* Database Records History Section: Desktop Table + Mobile Flexbox Cards */}
            <div className={`${styles.historySection} no-print`}>
              <div className={styles.historyHeader}>
                <div>
                  <h3 className={styles.historyTitle}>🎓 Student Certificate Database ({records.length} Issued)</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                    Verified graduate credentials recognized across recruitment partner networks in India &amp; USA.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRecords(getAllCertificates());
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    🔄 Refresh Registry
                  </button>
                </div>
              </div>

              {/* DESKTOP TABLE VIEW (Visible > 860px) */}
              <div className={styles.desktopTableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Credential ID</th>
                      <th>Candidate Name</th>
                      <th>Course Program</th>
                      <th>Issue Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => (
                      <tr key={rec.id}>
                        <td>
                          <strong style={{ fontFamily: "monospace", color: "#0284c7" }}>
                            {rec.id}
                          </strong>
                        </td>
                        <td>
                          <strong>{rec.candidateName}</strong>
                        </td>
                        <td>{rec.courseTitle}</td>
                        <td>{rec.issueDate}</td>
                        <td>
                          <span className={`${styles.statusPill} ${styles.statusVerified}`}>
                            ✓ {rec.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={() => handleLoadRecord(rec)}
                              className={styles.actionIconBtn}
                              title="Load into generator"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyPrivateLink(rec.id)}
                              className={styles.actionIconBtn}
                              style={{
                                background: copiedId === rec.id ? "#dcfce7" : undefined,
                                color: copiedId === rec.id ? "#166534" : undefined,
                                fontWeight: copiedId === rec.id ? 700 : undefined,
                              }}
                              title="Copy direct private certificate link"
                            >
                              {copiedId === rec.id ? "✓ Copied" : "📋 Copy Link"}
                            </button>
                            <Link
                              to={`/certificate/${encodeURIComponent(rec.id)}`}
                              target="_blank"
                              className={styles.actionIconBtn}
                              title="Open public recruiter verification page"
                            >
                              🔗 View Page
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE FLEXBOX CARDS VIEW (Visible <= 860px, All-in-One Screen, No Horizontal Scroll) */}
              <div className={styles.mobileCardList}>
                {records.map((rec) => (
                  <div key={rec.id} className={styles.mobileCertCard}>
                    <div className={styles.mCardTopRow}>
                      <strong style={{ fontFamily: "monospace", color: "#0284c7", fontSize: "0.92rem" }}>
                        {rec.id}
                      </strong>
                      <span className={`${styles.statusPill} ${styles.statusVerified}`}>
                        ✓ {rec.status}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                        {rec.candidateName}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#0369a1", fontWeight: 700 }}>
                        {rec.courseTitle}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        📅 Issued: {rec.issueDate} · Specialization: {rec.specialization || "Tech Masterclass"}
                      </div>
                    </div>

                    <div className={styles.mCardActionsRow}>
                      <button
                        type="button"
                        onClick={() => handleLoadRecord(rec)}
                        className={styles.actionReceiptBtn}
                        style={{ flex: 1 }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyPrivateLink(rec.id)}
                        className={styles.actionWhatsAppBtn}
                        style={{
                          flex: 1.2,
                          background: copiedId === rec.id ? "#dcfce7" : undefined,
                          color: copiedId === rec.id ? "#166534" : undefined,
                        }}
                      >
                        {copiedId === rec.id ? "✓ Copied" : "📋 Copy Link"}
                      </button>
                      <Link
                        to={`/certificate/${encodeURIComponent(rec.id)}`}
                        target="_blank"
                        className={styles.issueCertBtn}
                        style={{ flex: 1.2, textDecoration: "none" }}
                      >
                        🔗 Recruiter Page
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: REGISTERED STUDENTS ACCOUNTS DIRECTORY             */}
        {/* ========================================================= */}
        {activeTab === "students" && (
          <div className="no-print">
            <div className={styles.salesTableCard}>
              <div className={styles.toolbarTopRow}>
                <div>
                  <h3 className={styles.toolbarTitle}>
                    👥 Registered Student Accounts ({registeredStudents.length} Learners)
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "#64748b" }}>
                    Official learner accounts registered for cohort access, course syllabus downloads, and career placement drives.
                  </p>
                </div>
                <Link to="/register" className="btn btn-outline btn-sm" style={{ borderColor: "#0284c7", color: "#0284c7" }}>
                  Registration Portal →
                </Link>
              </div>

              {registeredStudents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>👥</div>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", marginBottom: "6px" }}>
                    No Registered Accounts Yet
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "420px", margin: "0 auto" }}>
                    When learners create student accounts, their profiles and enrollment status will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE VIEW (Visible > 860px) */}
                  <div className={styles.desktopTableWrap}>
                    <table className={styles.salesTable}>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email Address</th>
                          <th>Account Role</th>
                          <th>Placement Assistance</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredStudents.map((st, i) => (
                          <tr key={i}>
                            <td>
                              <strong>{st.name}</strong>
                            </td>
                            <td style={{ wordBreak: "break-all" }}>{st.email}</td>
                            <td>
                              <span style={{ background: "#f0f9ff", color: "#0369a1", padding: "3px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                                🎓 Student
                              </span>
                            </td>
                            <td>
                              <span style={{ color: "#166534", fontWeight: 700, fontSize: "0.8rem" }}>
                                🎯 100% Eligible
                              </span>
                            </td>
                            <td>
                              <span className={`${styles.statusPill} ${styles.statusVerified}`}>
                                ✓ Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE FLEXBOX CARDS VIEW (Visible <= 860px, All-in-One Screen, No Horizontal Scroll) */}
                  <div className={styles.mobileCardList}>
                    {registeredStudents.map((st, i) => (
                      <div key={i} className={styles.mobileStudentCard}>
                        <div className={styles.mCardTopRow}>
                          <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{st.name}</strong>
                          <span className={`${styles.statusPill} ${styles.statusVerified}`}>
                            ✓ Active
                          </span>
                        </div>
                        <div style={{ fontSize: "0.84rem", color: "#475569", wordBreak: "break-all", margin: "2px 0" }}>
                          ✉️ {st.email}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", paddingTop: "8px", borderTop: "1px dashed #e2e8f0" }}>
                          <span style={{ background: "#f0f9ff", color: "#0369a1", padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                            🎓 Student Role
                          </span>
                          <span style={{ color: "#166534", fontWeight: 700, fontSize: "0.8rem" }}>
                            🎯 100% Eligible
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD MANUAL / COUNSELOR COURSE SALE ENTRY            */}
      {/* ========================================================= */}
      {showAddSaleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddSaleModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>➕ Record Course Enrollment Sale</h3>
              <button className={styles.closeBtn} onClick={() => setShowAddSaleModal(false)}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px", lineHeight: "1.4" }}>
              Manually register an offline enrollment, corporate student sponsorship, or admissions counselor closed seat into the central revenue database.
            </p>

            {saleFeedbackMsg && (
              <div style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "8px 12px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "14px", fontWeight: 700 }}>
                {saleFeedbackMsg}
              </div>
            )}

            <form onSubmit={handleCreateManualSale} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newSaleName}
                  onChange={(e) => setNewSaleName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Student Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={newSaleEmail}
                  onChange={(e) => setNewSaleEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newSalePhone}
                  onChange={(e) => setNewSalePhone(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Course Program *
                </label>
                <select
                  value={newSaleCourse}
                  onChange={(e) => {
                    setNewSaleCourse(e.target.value);
                    const found = courses.find((c) => c.title === e.target.value);
                    if (found) setNewSaleAmount(found.price);
                  }}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title} — {formatPrice(c.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.modalGrid2Col}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    Cohort Slot
                  </label>
                  <select
                    value={newSaleCohort}
                    onChange={(e) => setNewSaleCohort(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  >
                    <option value="Evening Batch (7:00 PM – 9:00 PM IST)">Evening Batch (7-9 PM)</option>
                    <option value="Weekend Fast-Track (10:00 AM – 2:00 PM IST)">Weekend Fast-Track</option>
                    <option value="Morning Batch (7:30 AM – 9:00 AM IST)">Morning Batch (7:30-9 AM)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    Fee Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newSaleAmount}
                    onChange={(e) => setNewSaleAmount(Number(e.target.value))}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div className={styles.modalGrid2Col}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    Payment Mode
                  </label>
                  <select
                    value={newSalePaymentMethod}
                    onChange={(e) => setNewSalePaymentMethod(e.target.value as any)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  >
                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                    <option value="Razorpay UPI">Razorpay UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="EMI">EMI</option>
                    <option value="Offline Admissions">Offline Admissions</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    Lead Source
                  </label>
                  <select
                    value={newSaleSource}
                    onChange={(e) => setNewSaleSource(e.target.value as any)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  >
                    <option value="Admissions Desk">Admissions Desk</option>
                    <option value="Counselor Assisted">Counselor Assisted</option>
                    <option value="Website Razorpay">Website Razorpay</option>
                    <option value="Corporate Referral">Corporate Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Notes &amp; Onboarding Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Counselor closed, sent bank transfer receipt"
                  value={newSaleNotes}
                  onChange={(e) => setNewSaleNotes(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: "linear-gradient(135deg, #166534 0%, #15803d 100%)", color: "#ffffff", border: "none", borderRadius: "8px", padding: "11px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  Save Course Sale Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
                  style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", padding: "11px 16px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CHANGE ADMIN CREDENTIALS & SECURITY                */}
      {/* ========================================================= */}
      {showSettingsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSettingsModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>🔑 Admin Security &amp; Password Settings</h3>
              <button className={styles.closeBtn} onClick={() => setShowSettingsModal(false)}>
                ✕
              </button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.4" }}>
              Customize your administrator email and password anytime. These credentials are required for all administrative access.
            </p>

            {settingsError && (
              <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "14px", fontWeight: 600 }}>
                {settingsError}
              </div>
            )}

            {settingsSuccess && (
              <div style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "8px 12px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "14px", fontWeight: 700 }}>
                {settingsSuccess}
              </div>
            )}

            <form onSubmit={handleSaveAdminSettings} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Admin Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Administrator"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter admin email address"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Enter new strong password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              {newAdminPass && (
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmAdminPass}
                    onChange={(e) => setConfirmAdminPass(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "8px", padding: "10px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  Save New Credentials
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", padding: "10px 16px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
