import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import styles from "./Navbar.module.css";
import Logo from "@/components/ui/Logo";
import { getWhatsAppUrl } from "@/utils/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const navigate = useNavigate();
  const location = useLocation();

  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  const { currency, currencyInfo, setCurrency, availableCurrencies } = useCurrency();
  const { user, logout, isAuthenticated } = useAuth();

  // Initialize theme from localStorage or default to light
  useEffect(() => {
    const savedTheme = (localStorage.getItem("skilltosettle-theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("skilltosettle-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setLoginDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setCurrencyDropdownOpen(false);
    setLoginDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  interface NavLinkItem {
    label: string;
    path: string;
    hasDropdown?: boolean;
    badge?: string;
  }

  const navLinks: NavLinkItem[] = [
    { label: "Home", path: "/" },
    { label: "Courses", path: "/courses", hasDropdown: true },
    { label: "Classes", path: "/live-classes" },
    { label: "Career", path: "/career-finder" },
    { label: "Instructors", path: "/instructors" },
    { label: "Contact Us", path: "/contact" },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className={styles.topAnnouncementBar}>
        <div className={`container ${styles.announcementInner}`}>
          <div className={styles.announcementLeft}>
            <span className={styles.panIndiaBadge}>100% PLACEMENT ASSISTANCE</span>
            <span className={styles.certIncludedPill}>🎓 COURSE COMPLETION CERTIFICATE INCLUDED</span>
            <span className={styles.announcementText}>
              Live Cohorts &amp; Placement Support Across <strong>India &amp; USA</strong> 🇮🇳 🇺🇸
            </span>
          </div>
          <div className={styles.announcementRight}>
            <a
              href={getWhatsAppUrl("Hi! I would like to consult with an admissions counselor regarding 100% placement assistance in India & USA.")}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topWhatsAppLink}
              aria-label="Contact admissions on WhatsApp"
            >
              <span>💬</span>
              <span className={styles.whatsAppLabel}>WhatsApp</span>
              <span className={styles.whatsAppNumberFull}>: <strong>+1 832-936-7679</strong></span>
            </a>
          </div>
        </div>
      </div>

      <header className={`${styles.headerWrapper} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`container ${styles.headerContainer}`}>
          <div className={styles.navbarPill}>
            {/* Logo */}
            <div className={styles.logoWrap}>
              <Logo variant={theme === "dark" ? "light" : "dark"} size="md" />
            </div>

            {/* Search bar inside header (fluidly compressible) */}
            <form className={styles.headerSearchForm} onSubmit={handleSearchSubmit}>
              <span className={styles.headerSearchIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search courses, skills, tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.headerSearchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.headerSearchClearBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Desktop Navigation */}
            <nav className={styles.desktopNav} aria-label="Main Navigation">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;

                if (item.hasDropdown) {
                  return (
                    <div
                      key={item.label}
                      className={styles.dropdownWrapper}
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <Link
                        to={item.path}
                        className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
                      >
                        <span>{item.label}</span>
                        <svg className={styles.chevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </Link>

                      {dropdownOpen && (
                        <div className={styles.megaMenu}>
                          <div className={styles.megaHeader}>
                            <span className={styles.megaLabel}>FLAGSHIP LIVE TECH COHORTS</span>
                            <span className={styles.megaAssistanceBadge}>🎯 100% Placement Assistance • India &amp; USA</span>
                            <span className={styles.certIncludedPill} style={{ fontSize: "0.7rem", padding: "3px 8px" }}>🎓 COURSE COMPLETION CERTIFICATE INCLUDED</span>
                            <Link to="/courses" className={styles.megaAll}>View All Syllabi →</Link>
                          </div>
                          <div className={styles.megaGrid}>
                            <Link to="/courses/cyber-security" className={styles.megaItem}>
                              <span className={styles.megaIcon} style={{ fontSize: "1.2rem", color: "#00d4aa" }}>🛡️</span>
                              <div>
                                <div className={styles.megaTitle}>Cyber Security &amp; Ethical Hacking</div>
                                <div className={styles.megaMentorTag}>Mentor: Suresh (Security Architect)</div>
                                <div className={styles.megaSub}>SOC Operations, Splunk, Penetration Testing</div>
                              </div>
                            </Link>
                            <Link to="/courses/data-analytics-engineering-science" className={styles.megaItem}>
                              <span className={styles.megaIcon} style={{ fontSize: "1.2rem", color: "#6366f1" }}>📊</span>
                              <div>
                                <div className={styles.megaTitle}>Data Analytics &amp; Engineering</div>
                                <div className={styles.megaMentorTag}>Mentor: Nikhil (Data Architect)</div>
                                <div className={styles.megaSub}>SQL, Python, Spark, Airflow, Power BI</div>
                              </div>
                            </Link>
                            <Link to="/courses/dsa-python-java" className={styles.megaItem}>
                              <span className={styles.megaIcon} style={{ fontSize: "1.2rem", color: "#f59e0b" }}>⚡</span>
                              <div>
                                <div className={styles.megaTitle}>DSA with Python &amp; Java</div>
                                <div className={styles.megaMentorTag}>Mentor: Kiran (Algorithms Lead)</div>
                                <div className={styles.megaSub}>LeetCode, DP, System Design</div>
                              </div>
                            </Link>
                            <Link to="/courses/devops-with-ai" className={styles.megaItem}>
                              <span className={styles.megaIcon} style={{ fontSize: "1.2rem", color: "#0284c7" }}>☁️</span>
                              <div>
                                <div className={styles.megaTitle}>DevOps with AI &amp; Cloud</div>
                                <div className={styles.megaMentorTag}>Mentor: Eswar (Cloud Architect)</div>
                                <div className={styles.megaSub}>Kubernetes, Docker, Terraform, CI/CD</div>
                              </div>
                            </Link>
                            <Link to="/courses/sql-database-analytics" className={styles.megaItem}>
                              <span className={styles.megaIcon} style={{ fontSize: "1.2rem", color: "#8b5cf6" }}>📈</span>
                              <div>
                                <div className={styles.megaTitle}>SQL &amp; Database Analytics</div>
                                <div className={styles.megaMentorTag}>Mentor: Narendra (DB Architect)</div>
                                <div className={styles.megaSub}>Window Functions, Indexing, Power BI</div>
                              </div>
                            </Link>
                            <Link to="/courses/business-analyst" className={styles.megaItem}>
                              <span className={styles.megaIcon} style={{ fontSize: "1.2rem", color: "#0d9488" }}>💼</span>
                              <div>
                                <div className={styles.megaTitle}>Business Analyst &amp; Strategy</div>
                                <div className={styles.megaMentorTag}>Mentor: Shyam (Lead BA)</div>
                                <div className={styles.megaSub}>Agile, BRD/FRD, JIRA, User Stories</div>
                              </div>
                            </Link>
                            <Link to="/courses/ielts-preparation" className={styles.megaItem} style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border-light, #f1f5f9)", paddingTop: "8px" }}>
                              <span className={styles.megaIcon} style={{ fontSize: "1.2rem", color: "#10b981" }}>🌍</span>
                              <div>
                                <div className={styles.megaTitle}>IELTS 7.5+ Band Masterclass</div>
                                <div className={styles.megaMentorTag}>Mentor: Gurpreet (Master Coach)</div>
                                <div className={styles.megaSub}>Speaking Fluency, Writing Task 1 &amp; 2, Global Visa Readiness</div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
                  >
                    <span>{item.label}</span>
                    {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons: Location Currency Switcher, Theme Toggle & Sign In */}
            <div className={styles.navActions}>
              {/* Location Currency Selector */}
              <div
                ref={currencyDropdownRef}
                className={styles.currencySelectorWrap}
                onMouseEnter={() => setCurrencyDropdownOpen(true)}
                onMouseLeave={() => setCurrencyDropdownOpen(false)}
              >
                <button
                  type="button"
                  className={styles.currencyBtn}
                  onClick={() => setCurrencyDropdownOpen((prev) => !prev)}
                  title={`Current Currency: ${currencyInfo.name} (${currencyInfo.symbol.trim()})`}
                  aria-label="Select Currency"
                >
                  <span className={styles.currencySymbol}>{currencyInfo.symbol.trim()}</span>
                  <span className={styles.currencyCode}>{currency}</span>
                  <svg className={styles.currencyChevron} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {currencyDropdownOpen && (
                  <div className={styles.currencyDropdown}>
                    <div className={styles.currencyDropdownHeader}>Select Currency</div>
                    <div className={styles.currencyList}>
                      {availableCurrencies.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          className={`${styles.currencyOption} ${c.code === currency ? styles.currencyOptionActive : ""}`}
                          onClick={() => {
                            setCurrency(c.code);
                            setCurrencyDropdownOpen(false);
                          }}
                        >
                          <span className={styles.optionSymbol}>{c.symbol.trim()}</span>
                          <span className={styles.optionName}>{c.code} — {c.name}</span>
                          {c.code === currency && <span className={styles.optionCheck}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sun & Moon Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={styles.themeToggleBtn}
                title={theme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
                aria-label="Toggle Theme"
              >
                {theme === "light" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>

              {/* Auth Controls: Single Login Button with Selection Menu */}
              {isAuthenticated && user ? (
                <div className={styles.userProfileWrap}>
                  {user.role === "Admin" ? (
                    <>
                      <Link
                        to="/admin"
                        className={styles.adminBadge}
                        title="Open Admin Operations & Sales Portal (/admin)"
                      >
                        🛡️ Admin
                      </Link>
                      <Link
                        to="/admin/profile"
                        className={styles.profileBtn}
                        title="Open Admin Profile"
                      >
                        Profile
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/student"
                      className={styles.profileBtn}
                      title="Open Student Profile (/student)"
                    >
                      🎓 Profile
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className={styles.logoutBtn}
                    title="Log out"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div
                  ref={loginDropdownRef}
                  className={styles.loginDropdownWrap}
                  onMouseEnter={() => setLoginDropdownOpen(true)}
                  onMouseLeave={() => setLoginDropdownOpen(false)}
                >
                  <button
                    type="button"
                    className={styles.loginBtn}
                    title="Choose Login Account"
                    onClick={() => setLoginDropdownOpen((prev) => !prev)}
                    aria-expanded={loginDropdownOpen}
                  >
                    <span>Login</span>
                    <svg
                      className={styles.loginChevron}
                      style={{ transform: loginDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {loginDropdownOpen && (
                    <div className={styles.loginDropdownMenu}>
                      <Link
                        to="/login?role=student"
                        className={styles.loginDropdownItem}
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        <span className={styles.loginItemIcon}>🎓</span>
                        <div>
                          <div className={styles.loginItemTitle}>Student Login</div>
                          <div className={styles.loginItemSub}>Course batches &amp; certificates</div>
                        </div>
                      </Link>

                      <Link
                        to="/login?role=admin"
                        className={styles.loginDropdownItem}
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        <span className={styles.loginItemIcon}>🛡️</span>
                        <div>
                          <div className={styles.loginItemTitle}>Admin Portal</div>
                          <div className={styles.loginItemSub}>Management &amp; sales desk</div>
                        </div>
                      </Link>

                      <div className={styles.loginDropdownDivider} />

                      <Link
                        to="/register"
                        className={styles.loginDropdownItemRegister}
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        <span>New Student? <strong>Register Here →</strong></span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Hamburger Mobile Toggle */}
              <button
                className={styles.hamburger}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle Navigation"
                aria-expanded={mobileOpen}
              >
                <span className={`${styles.bar} ${mobileOpen ? styles.bar1Open : ""}`}></span>
                <span className={`${styles.bar} ${mobileOpen ? styles.bar2Open : ""}`}></span>
                <span className={`${styles.bar} ${mobileOpen ? styles.bar3Open : ""}`}></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileHeader}>
              <div className={styles.mobileBrand}>SkilltoSettle Menu</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={toggleTheme}
                  className={styles.themeToggleBtn}
                  aria-label="Toggle Theme"
                >
                  {theme === "light" ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  )}
                </button>
                <button className={styles.closeBtn} onClick={() => setMobileOpen(false)}>✕</button>
              </div>
            </div>

            {/* Mobile Currency Selector */}
            <div className={styles.mobileCurrencyBox}>
              <label className={styles.mobileCurrencyLabel}>Location Currency:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={styles.mobileCurrencySelect}
              >
                {availableCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol.trim()} {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Search */}
            <form className={styles.mobileSearchForm} onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search courses and skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.mobileSearchInput}
              />
              <button type="submit" className={styles.mobileSearchBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
            
            <div className={styles.mobileTrustBadge}>
              🎯 100% Placement Assistance • Serving India &amp; USA 🇮🇳 🇺🇸
            </div>

            <div className={styles.mobileLinksList}>
              <Link to="/" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>Home</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link to="/courses" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>All Courses</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link to="/live-classes" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>Live Classes &amp; Batches</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link to="/career-finder" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>Career Assessment</span>
                <span className={styles.navBadge}>Career</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link to="/career-paths" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>Career Roadmaps</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link to="/instructors" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>Lead Instructors</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link to="/corporate" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>Corporate Training</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link to="/contact" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>Contact Us</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link to="/verify" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>🔍 Verify Credential</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link to="/privacy" className={styles.mobileItem} onClick={() => setMobileOpen(false)}>
                <span className={styles.mobileItemLabel}>🛡️ Privacy Policy</span>
                <span className={styles.arrow}>→</span>
              </Link>
            </div>

            <div className={styles.mobileCtasBox}>
              {isAuthenticated && user ? (
                <>
                  {user.role === "Admin" ? (
                    <>
                      <Link
                        to="/admin"
                        className="btn w-full"
                        style={{
                          background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                          color: "#ffffff",
                          marginBottom: "8px",
                          fontWeight: 700,
                        }}
                        onClick={() => setMobileOpen(false)}
                      >
                        🛡️ Open Admin Portal (/admin)
                      </Link>
                      <Link
                        to="/admin/profile"
                        className="btn w-full"
                        style={{
                          background: "var(--color-accent, #009bb9)",
                          color: "#ffffff",
                          marginBottom: "8px",
                          fontWeight: 700,
                        }}
                        onClick={() => setMobileOpen(false)}
                      >
                        👤 Admin Profile
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/student"
                      className="btn w-full"
                      style={{
                        background: "var(--color-accent, #009bb9)",
                        color: "#ffffff",
                        marginBottom: "8px",
                        fontWeight: 700,
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      🎓 Student Profile (/student)
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="btn btn-outline w-full"
                    style={{ color: "#ef4444", borderColor: "#ef4444", fontWeight: 700, marginBottom: "8px" }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px", width: "100%" }}>
                  <Link
                    to="/login?role=student"
                    className="btn w-full"
                    style={{
                      background: "var(--color-accent, #009bb9)",
                      color: "#ffffff",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      textDecoration: "none",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    🎓 Student Login
                  </Link>
                  <Link
                    to="/login?role=admin"
                    className="btn w-full"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                      color: "#ffffff",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      textDecoration: "none",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    🛡️ Admin Portal
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-outline w-full"
                    style={{ borderColor: "#0284c7", color: "#0284c7", fontWeight: 700, textDecoration: "none" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    📝 Register as New Student
                  </Link>
                </div>
              )}
              <Link to="/career-finder" className="btn btn-primary w-full" onClick={() => setMobileOpen(false)}>
                Start Free Assessment
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
