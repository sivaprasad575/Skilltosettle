import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import Logo from "@/components/ui/Logo";
import PaymentBadges from "@/components/ui/PaymentBadges";
import { CONTACT_CONFIG, getWhatsAppUrl } from "@/utils/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        {/* Universal Trust Guarantees Ribbon */}
        <div className={styles.trustRibbon}>
          <div className={styles.trustRibbonItem}>
            <span className={styles.trustRibbonIcon}>🎓</span>
            <div className={styles.trustRibbonText}>
              <strong className={styles.trustCertTitle}>Course Completion Certificate Included</strong>
              <span>Verifiable credential accredited in USA &amp; India</span>
            </div>
          </div>
          <div className={styles.trustRibbonItem}>
            <span className={styles.trustRibbonIcon}>🎯</span>
            <div className={styles.trustRibbonText}>
              <strong>100% Placement Assistance</strong>
              <span>Dedicated hiring partners in India &amp; USA</span>
            </div>
          </div>
          <div className={styles.trustRibbonItem}>
            <span className={styles.trustRibbonIcon}>👨‍🏫</span>
            <div className={styles.trustRibbonText}>
              <strong>Live Industry Architect Mentors</strong>
              <span>Real production capstones &amp; 1-on-1 code reviews</span>
            </div>
          </div>
        </div>

        {/* Contact Strip Box */}
        <div className={styles.callStrip}>
          <div className={styles.callLeft}>
            <div className={styles.headsetIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
            </div>
            <div>
              <span className={styles.stripLabel}>100% PLACEMENT ASSISTANCE • 24/7 CALL &amp; WHATSAPP DESK</span>
              <div className={styles.phoneNumbers}>
                <a href={`tel:${CONTACT_CONFIG.indiaPhoneTel}`} className={styles.phoneLink}>
                  India: {CONTACT_CONFIG.indiaPhone}
                </a>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                <a href={getWhatsAppUrl("Hi! I would like to inquire about 100% placement assistance courses for India & USA.")} target="_blank" rel="noopener noreferrer" className={styles.phoneLink}>
                  USA / WhatsApp: {CONTACT_CONFIG.usaPhone}
                </a>
              </div>
            </div>
          </div>

          <div className={styles.callRight}>
            <div className={styles.addressBox}>
              <span className={styles.stripLabel}>USA GLOBAL HQ &amp; INDIA DELIVERY</span>
              <span className={styles.addressText}>6464 Savoy Dr, Suite 777, Houston, TX 77036</span>
            </div>
            <div className={styles.emailBox}>
              <span className={styles.stripLabel}>DIRECT INQUIRIES</span>
              <a href="mailto:info@skilltosettle.com" className={styles.emailLink}>info@skilltosettle.com</a>
            </div>
          </div>
        </div>

        <div className={styles.topSection}>
          {/* Brand Info & Mission */}
          <div className={styles.brandCol}>
            <Logo variant="dark" size="md" />
            <p className={styles.description}>
              SkilltoSettle empowers ambitious students, fresh graduates, and working professionals across India, the USA, and worldwide to master high-growth technologies with 100% placement assistance, real-time live capstone projects, and accredited certifications.
            </p>

            {/* Newsletter */}
            <div className={styles.newsletterBox}>
              <span className={styles.newsletterLabel}>Get Instant Course Updates & Scholarships</span>
              {subscribed ? (
                <div className={styles.subSuccess}>✓ Subscribed for weekly tech digests!</div>
              ) : (
                <form onSubmit={handleNewsletter} className={styles.newsForm}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className={styles.newsInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit" className={styles.newsBtn}>
                    Join
                  </button>
                </form>
              )}
            </div>

            {/* Social Links */}
            <div className={styles.socialLinks}>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Explore Programs</h4>
            <ul className={styles.linkList}>
              <li><Link to="/courses" className={styles.link}>All Live Cohorts</Link></li>
              <li><Link to="/career-paths" className={styles.link}>Career Paths Roadmap</Link></li>
              <li><Link to="/live-classes" className={styles.link}>Live Interactive Batches</Link></li>
              <li><Link to="/career-finder" className={styles.link}>2-Min Career Assessment</Link></li>
              <li><Link to="/success-stories" className={styles.link}>Student Success Stories</Link></li>
            </ul>
          </div>

          {/* Popular Programs Column */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Flagship Courses</h4>
            <ul className={styles.linkList}>
              <li><Link to="/courses/cyber-security" className={styles.link}>Cyber Security (Suresh)</Link></li>
              <li><Link to="/courses/data-analytics-engineering-science" className={styles.link}>Data Analytics &amp; Science (Nikhil)</Link></li>
              <li><Link to="/courses/dsa-python-java" className={styles.link}>DSA with Python &amp; Java (Kiran)</Link></li>
            </ul>
          </div>

          {/* Support & Corporate */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Admissions & Support</h4>
            <ul className={styles.linkList}>
              <li><Link to="/contact" className={styles.link} style={{ color: "#38bdf8", fontWeight: 700 }}>🎯 100% Placement Desk</Link></li>
              <li><Link to="/student" className={styles.link} style={{ color: "#38bdf8" }}>🎓 Student Login (/student)</Link></li>
              <li><Link to="/admin" className={styles.link} style={{ color: "#c084fc" }}>🛡️ Admin Portal (/admin)</Link></li>
              <li><Link to="/verify" className={styles.link} style={{ color: "#34d399", fontWeight: 700 }}>🔍 Verify Certificate / Credential</Link></li>
              <li><a href={getWhatsAppUrl("Hi! I would like to speak to an admissions advisor at SkilltoSettle for India & USA courses.")} target="_blank" rel="noopener noreferrer" className={styles.link}>WhatsApp Advisor ({CONTACT_CONFIG.whatsappDisplay})</a></li>
              <li><Link to="/instructors" className={styles.link}>Meet Lead Mentors (India &amp; USA)</Link></li>
              <li><Link to="/corporate" className={styles.link}>Enterprise Upskilling</Link></li>
              <li><Link to="/contact" className={styles.link}>Contact India &amp; USA Desks</Link></li>
              <li><Link to="/privacy" className={styles.link} style={{ color: "var(--color-primary, #0284c7)", fontWeight: 600 }}>🛡️ Privacy Policy</Link></li>
              <li><Link to="/terms" className={styles.link}>Terms of Service</Link></li>
              <li><Link to="/refund" className={styles.link}>Refund &amp; Cancellation</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Payment & Legal */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomLeft}>
            <p className={styles.copyright}>
              © {currentYear} SkilltoSettle (SkilltoSettle.com). 100% Placement Assistance • Serving Learners Across India &amp; USA. All rights reserved.
            </p>
            <div className={styles.legalLinksRow}>
              <Link to="/privacy" className={styles.legalLink}>Privacy Policy</Link>
              <span className={styles.legalDivider}>•</span>
              <Link to="/terms" className={styles.legalLink}>Terms of Service</Link>
              <span className={styles.legalDivider}>•</span>
              <Link to="/refund" className={styles.legalLink}>Refund &amp; Cancellation Policy</Link>
              <span className={styles.legalDivider}>•</span>
              <Link to="/verify" className={styles.legalLink}>Verify Credential</Link>
            </div>
          </div>

          <div className={styles.paymentMethods}>
            <PaymentBadges />
          </div>
        </div>
      </div>
    </footer>
  );
}
