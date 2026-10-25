import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import styles from "./CertificateShowcase.module.css";

export interface CertificateTrack {
  id: string;
  tabLabel: string;
  icon: string;
  courseTitle: string;
  specialization: string;
  mentorName: string;
  mentorTitle: string;
  mentorSignature: string;
  credentialCode: string;
  skills: string[];
  capstoneName: string;
}

const CERTIFICATE_TRACKS: CertificateTrack[] = [
  {
    id: "cyber-security",
    tabLabel: "Cyber Security (Suresh)",
    icon: "🛡️",
    courseTitle: "Cyber Security & Ethical Hacking Masterclass",
    specialization: "Offensive Security, SOC Analysis & Threat Hunting",
    mentorName: "Suresh",
    mentorTitle: "Lead Technical Mentor · Offensive Security Specialist",
    mentorSignature: "Suresh",
    credentialCode: "STS-SEC-2026-8942",
    skills: ["Ethical Hacking", "SIEM / SOC Operations", "Network Defense", "Kali Linux", "Threat Hunting"],
    capstoneName: "Enterprise SOC Defense & Live Infrastructure Pentest",
  },
  {
    id: "data-analytics",
    tabLabel: "Data Analytics & AI (Nikhil)",
    icon: "📊",
    courseTitle: "Data Analytics, Data Engineering & Data Science Masterclass",
    specialization: "Big Data Pipelines, Cloud Lakehouses & Enterprise AI",
    mentorName: "Nikhil",
    mentorTitle: "Lead Technical Mentor · Staff Data Architect",
    mentorSignature: "Nikhil",
    credentialCode: "STS-DATA-2026-7319",
    skills: ["Python & SQL", "Apache Spark", "Databricks", "Cloud Lakehouses", "Machine Learning"],
    capstoneName: "Petabyte Real-Time Streaming & AI Lakehouse Architecture",
  },
  {
    id: "dsa",
    tabLabel: "DSA with Python & Java (Kiran)",
    icon: "⚡",
    courseTitle: "Data Structures & Algorithms (DSA) with Python & Java",
    specialization: "High-Scale System Design, Algorithmic Complexity & LeetCode Mastery",
    mentorName: "Kiran",
    mentorTitle: "Lead Technical Mentor · Principal Systems Engineer",
    mentorSignature: "Kiran",
    credentialCode: "STS-DSA-2026-6451",
    skills: ["Advanced DSA", "Python 3 & Java 21", "Dynamic Programming", "System Design", "FAANG Interview Patterns"],
    capstoneName: "Distributed High-Concurrency Microservices & Algorithmic Engine",
  },
];

export default function CertificateShowcase() {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);

  const currentTrack = CERTIFICATE_TRACKS[activeTrackIndex];

  return (
    <section className={`section ${styles.section}`}>
      <div className={styles.glowBlob}></div>

      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrowBadge}>
            <span>🎓 ACCREDITED COURSE COMPLETION CERTIFICATE INCLUDED</span>
          </div>
          <h2 className={styles.mainTitle}>
            Hands-on Projects &amp; Experience. <br />
            <span className={styles.highlightText}>Earn Your Industry Certificate.</span>
          </h2>
          <p className={styles.sectionSub}>
            Every student receives an accredited Course Completion Certificate with verifiable credentials, authorized by lead industry mentors and backed by our <strong>100% Placement Assistance Network across USA &amp; India</strong>.
          </p>
        </div>

        {/* Track Switcher Interactive Tabs */}
        <div className={styles.trackNav}>
          <span className={styles.trackNavLabel}>Select Course Track to Preview:</span>
          <div className={styles.trackPills}>
            {CERTIFICATE_TRACKS.map((track, idx) => (
              <button
                key={track.id}
                type="button"
                className={`${styles.trackPillBtn} ${activeTrackIndex === idx ? styles.trackPillBtnActive : ""}`}
                onClick={() => setActiveTrackIndex(idx)}
              >
                <span>{track.icon}</span>
                <span>{track.tabLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          {/* Left Column: Proof and Placement Assurances */}
          <div className={styles.copyCol}>
            <div className={styles.trackCardOverview}>
              <div className={styles.trackHeaderBadge}>
                <div className={styles.trackLogoBadge}>
                  <img src="/sts-logo.png" alt="STS Logo" className={styles.trackHeaderLogoImg} />
                </div>
                <div className={styles.trackHeaderInfo}>
                  <h4 className={styles.trackHeaderTitle}>{currentTrack.courseTitle}</h4>
                  <span className={styles.trackHeaderMentor}>
                    Lead Mentor: <strong>{currentTrack.mentorName}</strong> ({currentTrack.mentorTitle.split("·")[1]?.trim() || "Industry Veteran"})
                  </span>
                </div>
              </div>

              <div className={styles.capstoneHighlight}>
                <span className={styles.capstoneBadge}>Verified Capstone Project</span>
                <p className={styles.capstoneTitle}>"{currentTrack.capstoneName}"</p>
              </div>

              {/* Skills Tags */}
              <div className={styles.skillsTagList}>
                {currentTrack.skills.map((skill, i) => (
                  <span key={i} className={styles.skillTag}>
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Placement & Credential Highlights */}
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <span className={styles.checkCircle}>🎓</span>
                <span className={styles.benefitText}>
                  <strong>Course Completion Certificate Included:</strong> Accredited Course Completion Certificate with verifiable credential ID &amp; QR validation.
                </span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.checkCircle}>🎯</span>
                <span className={styles.benefitText}>
                  <strong>100% Placement Assistance:</strong> Direct job referrals with hiring partners in <strong>India &amp; USA</strong>.
                </span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.checkCircle}>✓</span>
                <span className={styles.benefitText}>
                  <strong>Mentor-Authorized Signature:</strong> Signed by Lead Mentor <strong>{currentTrack.mentorName}</strong> and Program Director.
                </span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.checkCircle}>✓</span>
                <span className={styles.benefitText}>
                  <strong>Instant Online Verification:</strong> Includes tamper-proof Verification QR code and registered Credential ID.
                </span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.checkCircle}>✓</span>
                <span className={styles.benefitText}>
                  <strong>Global Recognition:</strong> Share directly on LinkedIn, GitHub, and showcase during corporate interviews.
                </span>
              </div>
            </div>

            <div className={styles.actionRow}>
              <Link to="/courses" className={styles.ctaBtn}>
                <span>Explore All Cohorts &amp; Syllabi →</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Premium High-Fidelity Realistic Certificate Mockup */}
          <div className={styles.visualCol}>
            <div className={styles.mockupPerspectiveWrap}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTrack.id}
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={styles.certificateCard}
                  whileHover={{ rotateY: 0, rotateX: 0, y: -4, transition: { duration: 0.25 } }}
                >
                  {/* Floating Top Accredited Badges */}
                  <div className={styles.floatingBadgesRow}>
                    <span className={styles.floatingCertPill}>
                      🎓 COURSE COMPLETION CERTIFICATE INCLUDED
                    </span>
                    <span className={styles.floatingAssistancePill}>
                      🎯 100% PLACEMENT ASSISTANCE NETWORK
                    </span>
                  </div>

                {/* Outer Guilloche Border Frame */}
                <div className={styles.certOuterFrame}>
                  {/* Inner Gold Foil Frame */}
                  <div className={styles.certInnerFrame}>
                    {/* Ornate Corner Accents */}
                    <div className={styles.certCornerTL}></div>
                    <div className={styles.certCornerTR}></div>
                    <div className={styles.certCornerBL}></div>
                    <div className={styles.certCornerBR}></div>

                    {/* Watermark Security Seal with Official STS Logo */}
                    <div className={styles.watermarkBg}>
                      <img src="/sts-logo.png" alt="STS Watermark" className={styles.watermarkLogoImg} />
                      <span className={styles.watermarkText}>SKILLTOSETTLE</span>
                    </div>

                    {/* Certificate Header with Official STS Circular Logo */}
                    <div className={styles.certHeader}>
                      <div className={styles.brandLogoRow}>
                        <div className={styles.brandCrest}>
                          <img
                            src="/sts-logo.png"
                            alt="SkilltoSettle STS Logo"
                            className={styles.certBrandLogoImg}
                          />
                        </div>
                        <div className={styles.brandTextGroup}>
                          <span className={styles.brandName}>SKILLTOSETTLE GLOBAL ACADEMY</span>
                          <span className={styles.brandSub}>
                            Accredited Career &amp; Placement Network · Houston, TX, USA &amp; India
                          </span>
                        </div>
                      </div>

                      <div className={styles.certTitleWrap}>
                        <div className={styles.certPreTitle}>CERTIFICATE OF PROFESSIONAL EXCELLENCE</div>
                        <div className={styles.certTitleLine}></div>
                      </div>
                    </div>

                    {/* Certificate Award Body */}
                    <div className={styles.certBody}>
                      <div className={styles.certAwardedTo}>This is to proudly certify that</div>
                      <div className={styles.recipientName}>Rahul Verma</div>
                      <div className={styles.certReason}>
                        has demonstrated outstanding technical proficiency, completed real-world production capstone projects, and fulfilled all graduation requirements for
                      </div>
                      <div className={styles.courseName}>{currentTrack.courseTitle}</div>
                      <div className={styles.specializationPill}>
                        Specialization: {currentTrack.specialization}
                      </div>
                    </div>

                    {/* Certificate Footer with Dual Signatures & Gold Seal */}
                    <div className={styles.certFooter}>
                      {/* Left: Lead Mentor Signature */}
                      <div className={styles.signatureBox}>
                        <div className={styles.scriptSig}>{currentTrack.mentorSignature}</div>
                        <div className={styles.sigName}>{currentTrack.mentorName}</div>
                        <div className={styles.sigTitle}>Lead Technical Mentor</div>
                      </div>

                      {/* Center: 3D Embossed Metallic Gold Seal with Official STS Medallion */}
                      <div className={styles.goldSealWrapper}>
                        <div className={styles.goldSeal}>
                          <div className={styles.sealInnerRing}>
                            <div className={styles.sealLogoCircle}>
                              <img src="/sts-logo.png" alt="STS Seal Emblem" className={styles.sealLogoImg} />
                            </div>
                            <span className={styles.sealText}>VERIFIED</span>
                            <span className={styles.sealLocation}>USA · IND</span>
                          </div>
                        </div>
                        <div className={styles.ribbonWrap}>
                          <div className={styles.ribbonLeft}></div>
                          <div className={styles.ribbonRight}></div>
                        </div>
                      </div>

                      {/* Right: Program Director Signature */}
                      <div className={styles.signatureBox}>
                        <div className={styles.scriptSig}>Dr. Rajesh K.</div>
                        <div className={styles.sigName}>Dr. Rajesh K., Ph.D.</div>
                        <div className={styles.sigTitle}>Program Director</div>
                      </div>
                    </div>

                    {/* Verification Bar with ID, Date and QR */}
                    <div className={styles.certMetaBar}>
                      <div className={styles.certIdGroup}>
                        <span className={styles.certIdTag}>CREDENTIAL ID: {currentTrack.credentialCode}</span>
                        <span className={styles.certIssueDate}>Issued: {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className={styles.certQrBox}>
                        <div className={styles.miniQr}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="2" y="2" width="8" height="8" rx="1" fill="#fff" />
                            <rect x="4" y="4" width="4" height="4" fill="#0f172a" />
                            <rect x="14" y="2" width="8" height="8" rx="1" fill="#fff" />
                            <rect x="16" y="4" width="4" height="4" fill="#0f172a" />
                            <rect x="2" y="14" width="8" height="8" rx="1" fill="#fff" />
                            <rect x="4" y="16" width="4" height="4" fill="#0f172a" />
                            <rect x="14" y="14" width="4" height="4" fill="#fff" />
                            <rect x="18" y="18" width="4" height="4" fill="#fff" />
                          </svg>
                        </div>
                        <span>Scan to Verify Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
