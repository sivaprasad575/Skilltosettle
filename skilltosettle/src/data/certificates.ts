/**
 * SkilltoSettle Central Student Certificate Database & Persistence Service
 */

export interface CertificateRecord {
  id: string; // e.g. "STS-SEC-2026-8942"
  candidateName: string;
  courseTitle: string;
  specialization: string;
  mentorName: string;
  mentorSignature: string;
  directorName: string;
  directorTitle: string;
  issueDate: string; // e.g. "September 2026"
  status: "Verified" | "Under Review" | "Revoked";
  grade?: string;
  capstoneProject: string;
  skills: string[];
  candidateEmail?: string;
  createdAt: string;
}

// Pre-seeded verified graduate records
export const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    id: "STS-SEC-2026-8942",
    candidateName: "Rahul Verma",
    courseTitle: "Cyber Security & Ethical Hacking Masterclass",
    specialization: "Offensive Security, SOC Analysis & Threat Hunting",
    mentorName: "Suresh",
    mentorSignature: "Suresh",
    directorName: "Dr. Rajesh K., Ph.D.",
    directorTitle: "Program Director",
    issueDate: "September 2026",
    status: "Verified",
    grade: "Distinction (96.4%)",
    capstoneProject: "Enterprise Multi-VPC Perimeter Defense & SIEM Automation with Splunk",
    skills: ["SOC Tier 2", "Penetration Testing", "SIEM Architecture", "Network Forensics", "Zero-Trust Architecture"],
    candidateEmail: "rahul.verma@alumni.skilltosettle.com",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "STS-DATA-2026-7319",
    candidateName: "Pooja Deshmukh",
    courseTitle: "Data Analytics, Engineering & Science Masterclass",
    specialization: "Distributed Lakehouse Engineering & Apache Spark",
    mentorName: "Nikhil",
    mentorSignature: "Nikhil",
    directorName: "Dr. Rajesh K., Ph.D.",
    directorTitle: "Program Director",
    issueDate: "September 2026",
    status: "Verified",
    grade: "Distinction (98.1%)",
    capstoneProject: "High-Throughput E-Commerce Lakehouse Pipeline with Spark, Iceberg & DBT",
    skills: ["PySpark", "Apache Airflow", "Lakehouse Architecture", "DBT Transformations", "SQL Analytics"],
    candidateEmail: "pooja.deshmukh@alumni.skilltosettle.com",
    createdAt: "2026-09-05T12:00:00.000Z",
  },
  {
    id: "STS-DSA-2026-6451",
    candidateName: "Rohan Patel",
    courseTitle: "Data Structures & Algorithms with Python & Java",
    specialization: "High-Concurrency Scalable Systems & LeetCode Mastery",
    mentorName: "Kiran",
    mentorSignature: "Kiran",
    directorName: "Dr. Rajesh K., Ph.D.",
    directorTitle: "Program Director",
    issueDate: "September 2026",
    status: "Verified",
    grade: "Distinction (94.8%)",
    capstoneProject: "Distributed LRU In-Memory Cache with Concurrent Read-Write Locks",
    skills: ["Graph Theory", "Dynamic Programming", "Concurrency in Java", "LLD Architecture", "Algorithmic Complexity"],
    candidateEmail: "rohan.patel@alumni.skilltosettle.com",
    createdAt: "2026-09-10T14:30:00.000Z",
  },
  {
    id: "STS-DEV-2026-5120",
    candidateName: "Karthik Subramanian",
    courseTitle: "DevOps with AI & Cloud Engineering",
    specialization: "Kubernetes Orchestration, GitOps & Multi-Cloud Infrastructure",
    mentorName: "Eswar",
    mentorSignature: "Eswar",
    directorName: "Dr. Rajesh K., Ph.D.",
    directorTitle: "Program Director",
    issueDate: "September 2026",
    status: "Verified",
    grade: "Distinction (95.2%)",
    capstoneProject: "Zero-Downtime Blue-Green GitOps Deployment on AWS EKS with ArgoCD & Terraform",
    skills: ["Kubernetes", "Docker", "Terraform", "ArgoCD", "Prometheus & Grafana", "CI/CD Pipelines"],
    candidateEmail: "karthik.sub@alumni.skilltosettle.com",
    createdAt: "2026-09-12T09:15:00.000Z",
  }
];

const STORAGE_KEY = "skilltosettle_certificates_db_v2";

/**
 * Retrieve all certificates combining default seed data + user added certificates
 */
export function getAllCertificates(): CertificateRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CERTIFICATES));
      return INITIAL_CERTIFICATES;
    }
    const parsed: CertificateRecord[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("Error reading certificates from storage:", err);
    return INITIAL_CERTIFICATES;
  }
}

/**
 * Find a specific certificate by Credential ID (case-insensitive)
 */
export function getCertificateById(id: string): CertificateRecord | undefined {
  if (!id) return undefined;
  const cleanId = id.trim().toUpperCase();
  const all = getAllCertificates();
  return all.find((c) => c.id.trim().toUpperCase() === cleanId);
}

/**
 * Save or update a certificate record into the database
 */
export function saveCertificate(cert: CertificateRecord): void {
  const all = getAllCertificates();
  const existingIdx = all.findIndex((c) => c.id.trim().toUpperCase() === cert.id.trim().toUpperCase());
  if (existingIdx >= 0) {
    all[existingIdx] = cert;
  } else {
    all.unshift(cert); // Add newest first
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("Error saving certificate to storage:", err);
  }
}

/**
 * Generate next sequential Credential ID continuation
 * e.g., "STS-SEC-2026-8943"
 */
export function getNextCredentialId(prefix: string = "STS-SEC"): string {
  const year = new Date().getFullYear();
  const all = getAllCertificates();
  const cleanPrefix = prefix.replace(/-\d{4}-\d+$/, "").toUpperCase();

  // Find all records matching this prefix
  const matching = all.filter((c) => c.id.toUpperCase().startsWith(cleanPrefix));
  let maxNum = 8940; // baseline

  matching.forEach((c) => {
    const parts = c.id.split("-");
    const lastPart = parts[parts.length - 1];
    const num = parseInt(lastPart, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });

  return `${cleanPrefix}-${year}-${maxNum + 1}`;
}
