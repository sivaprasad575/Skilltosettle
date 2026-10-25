/**
 * SkilltoSettle Central Course Sales & Revenue Database Service
 * Provides full management, analytics, CSV reporting, and persistence for all course transactions.
 */

export interface CourseSale {
  id: string; // e.g. "STS-ORD-2026-9182"
  receiptNo: string; // e.g. "STS-REC-892415"
  paymentId: string; // Razorpay payment ID e.g. "pay_Q7Nx91kLm029"
  orderId?: string; // Razorpay Order ID e.g. "order_Q7Nx91kLm029"
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseTitle: string;
  courseSlug: string;
  category: string;
  cohortSchedule: string;
  amount: number; // Raw numeric amount in INR for arithmetic calculation
  currency: string; // "INR", "USD", "EUR", "GBP", "CAD", "AED", "AUD"
  paymentMethod: "Razorpay UPI" | "Credit Card" | "Debit Card" | "NetBanking" | "EMI" | "Direct Bank Transfer" | "Offline Admissions";
  paymentStatus: "Paid & Verified" | "Processing" | "Refunded" | "Cancelled";
  date: string; // ISO date string e.g. "2026-09-18T14:30:00.000Z"
  dateFormatted: string; // e.g. "Sep 18, 2026, 02:30 PM"
  source: "Website Razorpay" | "Counselor Assisted" | "Admissions Desk" | "Corporate Referral";
  notes?: string;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  refundedOrdersCount: number;
  averageOrderValue: number;
  successRatePercent: number;
  todayRevenue: number;
  todayOrdersCount: number;
  thisMonthRevenue: number;
  thisMonthOrdersCount: number;
  courseBreakdown: {
    courseTitle: string;
    category: string;
    ordersCount: number;
    revenue: number;
    percentageOfTotal: number;
  }[];
  cohortBreakdown: {
    schedule: string;
    ordersCount: number;
  }[];
  paymentMethodBreakdown: {
    method: string;
    ordersCount: number;
    revenue: number;
  }[];
}

// Initial realistic pre-seeded sales transactions across flagship courses
export const INITIAL_SALES: CourseSale[] = [
  {
    id: "STS-ORD-2026-9842",
    receiptNo: "STS-REC-892415",
    paymentId: "pay_Q9ZkLmNp8712",
    orderId: "order_Q9ZkLmNp8712",
    studentName: "Rahul Verma",
    studentEmail: "rahul.verma@alumni.skilltosettle.com",
    studentPhone: "+91 98450 12890",
    courseTitle: "Cyber Security & Ethical Hacking Mastery",
    courseSlug: "cyber-security",
    category: "Cyber Security",
    cohortSchedule: "Evening Batch (7:00 PM – 9:00 PM IST)",
    amount: 34999,
    currency: "INR",
    paymentMethod: "Razorpay UPI",
    paymentStatus: "Paid & Verified",
    date: "2026-09-18T14:30:00.000Z",
    dateFormatted: "Sep 18, 2026, 08:00 PM",
    source: "Website Razorpay",
    notes: "Enrolled in live evening cohort. Fast-track SOC tier 2 program.",
  },
  {
    id: "STS-ORD-2026-9780",
    receiptNo: "STS-REC-731902",
    paymentId: "pay_Q8XyRtPo3481",
    orderId: "order_Q8XyRtPo3481",
    studentName: "Pooja Deshmukh",
    studentEmail: "pooja.deshmukh@alumni.skilltosettle.com",
    studentPhone: "+91 97120 44512",
    courseTitle: "Data Analytics, Data Engineering & Data Science Masterclass",
    courseSlug: "data-analytics-engineering-science",
    category: "Data & AI",
    cohortSchedule: "Weekend Fast-Track (10:00 AM – 2:00 PM IST)",
    amount: 34999,
    currency: "INR",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid & Verified",
    date: "2026-09-17T11:15:00.000Z",
    dateFormatted: "Sep 17, 2026, 04:45 PM",
    source: "Website Razorpay",
    notes: "Transitioning to Data Lakehouse Engineer. Seeking USA relocation referral.",
  },
  {
    id: "STS-ORD-2026-9654",
    receiptNo: "STS-REC-645189",
    paymentId: "pay_Q7WvUeLk9012",
    orderId: "order_Q7WvUeLk9012",
    studentName: "Rohan Patel",
    studentEmail: "rohan.patel@alumni.skilltosettle.com",
    studentPhone: "+91 98234 56789",
    courseTitle: "DSA with Python & Java",
    courseSlug: "dsa-python-java",
    category: "Software Engineering",
    cohortSchedule: "Evening Batch (7:00 PM – 9:00 PM IST)",
    amount: 24999,
    currency: "INR",
    paymentMethod: "Razorpay UPI",
    paymentStatus: "Paid & Verified",
    date: "2026-09-16T16:20:00.000Z",
    dateFormatted: "Sep 16, 2026, 09:50 PM",
    source: "Website Razorpay",
    notes: "LeetCode high-concurrency algorithm cohort.",
  },
  {
    id: "STS-ORD-2026-9512",
    receiptNo: "STS-REC-512044",
    paymentId: "pay_Q6TuSdMj7845",
    orderId: "order_Q6TuSdMj7845",
    studentName: "Karthik Subramanian",
    studentEmail: "karthik.sub@alumni.skilltosettle.com",
    studentPhone: "+91 99401 23456",
    courseTitle: "DevOps with AI & Cloud Engineering",
    courseSlug: "devops-with-ai",
    category: "Cloud & DevOps",
    cohortSchedule: "Morning Batch (7:30 AM – 9:00 AM IST)",
    amount: 34999,
    currency: "INR",
    paymentMethod: "NetBanking",
    paymentStatus: "Paid & Verified",
    date: "2026-09-15T08:45:00.000Z",
    dateFormatted: "Sep 15, 2026, 02:15 PM",
    source: "Admissions Desk",
    notes: "Enrolled with Eswar batch. Kubernetes & Terraform specialized track.",
  },
  {
    id: "STS-ORD-2026-9421",
    receiptNo: "STS-REC-498217",
    paymentId: "pay_Q5RsQcHg4512",
    orderId: "order_Q5RsQcHg4512",
    studentName: "Sneha Reddy",
    studentEmail: "sneha.reddy@gmail.com",
    studentPhone: "+91 90001 98765",
    courseTitle: "SQL & Modern Database Analytics",
    courseSlug: "sql-database-analytics",
    category: "Database & SQL",
    cohortSchedule: "Weekend Fast-Track (10:00 AM – 2:00 PM IST)",
    amount: 18999,
    currency: "INR",
    paymentMethod: "Razorpay UPI",
    paymentStatus: "Paid & Verified",
    date: "2026-09-14T10:00:00.000Z",
    dateFormatted: "Sep 14, 2026, 03:30 PM",
    source: "Website Razorpay",
    notes: "Narendra mentor cohort. Business Intelligence focus.",
  },
  {
    id: "STS-ORD-2026-9389",
    receiptNo: "STS-REC-441209",
    paymentId: "pay_Q4PqPaDf2390",
    orderId: "order_Q4PqPaDf2390",
    studentName: "Ananya Iyer",
    studentEmail: "ananya.iyer@outlook.com",
    studentPhone: "+91 98840 54321",
    courseTitle: "Business Analyst & Product Strategy",
    courseSlug: "business-analyst",
    category: "Management & BA",
    cohortSchedule: "Evening Batch (7:00 PM – 9:00 PM IST)",
    amount: 27999,
    currency: "INR",
    paymentMethod: "EMI",
    paymentStatus: "Paid & Verified",
    date: "2026-09-12T13:10:00.000Z",
    dateFormatted: "Sep 12, 2026, 06:40 PM",
    source: "Counselor Assisted",
    notes: "Corporate career switch to Agile Product Management.",
  },
  {
    id: "STS-ORD-2026-9250",
    receiptNo: "STS-REC-398512",
    paymentId: "pay_Q3NoOzSa1278",
    orderId: "order_Q3NoOzSa1278",
    studentName: "Vikram Malhotra",
    studentEmail: "vikram.malhotra@techcorp.com",
    studentPhone: "+91 98110 76543",
    courseTitle: "Cyber Security & Ethical Hacking Mastery",
    courseSlug: "cyber-security",
    category: "Cyber Security",
    cohortSchedule: "Weekend Fast-Track (10:00 AM – 2:00 PM IST)",
    amount: 34999,
    currency: "INR",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid & Verified",
    date: "2026-09-10T09:30:00.000Z",
    dateFormatted: "Sep 10, 2026, 03:00 PM",
    source: "Corporate Referral",
    notes: "Sponsored corporate learner from Hyderabad.",
  },
  {
    id: "STS-ORD-2026-9120",
    receiptNo: "STS-REC-332190",
    paymentId: "pay_Q2MnNyRx9865",
    orderId: "order_Q2MnNyRx9865",
    studentName: "Harpreet Kaur",
    studentEmail: "harpreet.kaur@gmail.com",
    studentPhone: "+91 98720 11223",
    courseTitle: "IELTS 7.5+ Band Masterclass",
    courseSlug: "ielts-preparation",
    category: "Global English & Visa",
    cohortSchedule: "Morning Batch (7:30 AM – 9:00 AM IST)",
    amount: 14999,
    currency: "INR",
    paymentMethod: "Razorpay UPI",
    paymentStatus: "Paid & Verified",
    date: "2026-09-08T07:15:00.000Z",
    dateFormatted: "Sep 08, 2026, 12:45 PM",
    source: "Website Razorpay",
    notes: "Gurpreet coach cohort. USA H1B & Canada PR preparation.",
  },
  {
    id: "STS-ORD-2026-8990",
    receiptNo: "STS-REC-289410",
    paymentId: "pay_Q1LmNxWv8754",
    orderId: "order_Q1LmNxWv8754",
    studentName: "Manish Verma",
    studentEmail: "manish.verma@alumni.skilltosettle.com",
    studentPhone: "+91 99100 88776",
    courseTitle: "Data Analytics, Data Engineering & Data Science Masterclass",
    courseSlug: "data-analytics-engineering-science",
    category: "Data & AI",
    cohortSchedule: "Evening Batch (7:00 PM – 9:00 PM IST)",
    amount: 34999,
    currency: "INR",
    paymentMethod: "Razorpay UPI",
    paymentStatus: "Paid & Verified",
    date: "2026-09-05T15:45:00.000Z",
    dateFormatted: "Sep 05, 2026, 09:15 PM",
    source: "Website Razorpay",
    notes: "PySpark and Airflow project track.",
  },
  {
    id: "STS-ORD-2026-8840",
    receiptNo: "STS-REC-210459",
    paymentId: "pay_P9KjMwVu7643",
    orderId: "order_P9KjMwVu7643",
    studentName: "Divya Krishnan",
    studentEmail: "divya.krishnan@gmail.com",
    studentPhone: "+91 94440 33445",
    courseTitle: "Cyber Security & Ethical Hacking Mastery",
    courseSlug: "cyber-security",
    category: "Cyber Security",
    cohortSchedule: "Evening Batch (7:00 PM – 9:00 PM IST)",
    amount: 34999,
    currency: "INR",
    paymentMethod: "Debit Card",
    paymentStatus: "Paid & Verified",
    date: "2026-09-02T12:00:00.000Z",
    dateFormatted: "Sep 02, 2026, 05:30 PM",
    source: "Website Razorpay",
    notes: "SOC Analyst tier 1 to tier 2 progression.",
  }
];

const SALES_STORAGE_KEY = "skilltosettle_sales_db_v1";

/**
 * Retrieve all course sales combining default seed data + stored transactions
 */
export function getAllSales(): CourseSale[] {
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    const parsed: CourseSale[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("Error reading course sales from storage:", err);
    return INITIAL_SALES;
  }
}

/**
 * Get a specific sale record by Order ID or Receipt Number
 */
export function getSaleById(idOrReceipt: string): CourseSale | undefined {
  if (!idOrReceipt) return undefined;
  const clean = idOrReceipt.trim().toUpperCase();
  const all = getAllSales();
  return all.find(
    (s) =>
      s.id.trim().toUpperCase() === clean ||
      s.receiptNo.trim().toUpperCase() === clean ||
      s.paymentId.trim().toUpperCase() === clean
  );
}

/**
 * Save or update a course sale record
 */
export function saveSale(sale: CourseSale): void {
  const all = getAllSales();
  const existingIdx = all.findIndex((s) => s.id.trim().toUpperCase() === sale.id.trim().toUpperCase());
  if (existingIdx >= 0) {
    all[existingIdx] = sale;
  } else {
    all.unshift(sale); // Newest first
  }
  try {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("Error saving sale to storage:", err);
  }
}

/**
 * Update payment status for an existing order (e.g. Paid, Refunded, Cancelled)
 */
export function updateSaleStatus(
  id: string,
  newStatus: "Paid & Verified" | "Processing" | "Refunded" | "Cancelled",
  notes?: string
): boolean {
  const all = getAllSales();
  const idx = all.findIndex((s) => s.id.trim().toUpperCase() === id.trim().toUpperCase());
  if (idx >= 0) {
    all[idx].paymentStatus = newStatus;
    if (notes) {
      all[idx].notes = (all[idx].notes ? all[idx].notes + " | " : "") + notes;
    }
    try {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (err) {
      console.error("Error updating sale status:", err);
    }
  }
  return false;
}

/**
 * Delete a course sale record
 */
export function deleteSale(id: string): boolean {
  const all = getAllSales();
  const filtered = all.filter((s) => s.id.trim().toUpperCase() !== id.trim().toUpperCase());
  if (filtered.length !== all.length) {
    try {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error("Error deleting sale:", err);
    }
  }
  return false;
}

/**
 * Generate next sequential Order ID e.g. "STS-ORD-2026-9843"
 */
export function getNextOrderId(): string {
  const year = new Date().getFullYear();
  const all = getAllSales();
  let maxNum = 9840;
  all.forEach((s) => {
    const parts = s.id.split("-");
    const lastPart = parts[parts.length - 1];
    const num = parseInt(lastPart, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });
  return `STS-ORD-${year}-${maxNum + 1}`;
}

/**
 * Calculate deep revenue & sales performance analytics
 */
export function getSalesAnalytics(filterCourse?: string, filterStatus?: string): SalesSummary {
  const all = getAllSales();

  // Apply optional filters
  const sales = all.filter((s) => {
    if (filterCourse && filterCourse !== "ALL" && s.courseTitle !== filterCourse) {
      return false;
    }
    if (filterStatus && filterStatus !== "ALL" && s.paymentStatus !== filterStatus) {
      return false;
    }
    return true;
  });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalRevenue = 0;
  let paidOrdersCount = 0;
  let refundedOrdersCount = 0;
  let todayRevenue = 0;
  let todayOrdersCount = 0;
  let thisMonthRevenue = 0;
  let thisMonthOrdersCount = 0;

  const courseMap = new Map<string, { count: number; revenue: number; category: string }>();
  const cohortMap = new Map<string, number>();
  const paymentMethodMap = new Map<string, { count: number; revenue: number }>();

  sales.forEach((s) => {
    const isPaid = s.paymentStatus === "Paid & Verified";
    const isRefunded = s.paymentStatus === "Refunded";

    if (isPaid) {
      totalRevenue += s.amount;
      paidOrdersCount++;

      // Today calculation
      if (s.date.startsWith(todayStr)) {
        todayRevenue += s.amount;
        todayOrdersCount++;
      }

      // This Month calculation
      const saleDate = new Date(s.date);
      if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
        thisMonthRevenue += s.amount;
        thisMonthOrdersCount++;
      }

      // Course breakdown
      const cExisting = courseMap.get(s.courseTitle) || { count: 0, revenue: 0, category: s.category || "Cohort" };
      cExisting.count += 1;
      cExisting.revenue += s.amount;
      courseMap.set(s.courseTitle, cExisting);

      // Payment method breakdown
      const pExisting = paymentMethodMap.get(s.paymentMethod) || { count: 0, revenue: 0 };
      pExisting.count += 1;
      pExisting.revenue += s.amount;
      paymentMethodMap.set(s.paymentMethod, pExisting);
    }

    if (isRefunded) {
      refundedOrdersCount++;
    }

    // Cohort breakdown
    const cohortKey = s.cohortSchedule || "Standard Batch";
    cohortMap.set(cohortKey, (cohortMap.get(cohortKey) || 0) + 1);
  });

  const totalOrders = sales.length;
  const averageOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;
  const successRatePercent = totalOrders > 0 ? Math.round((paidOrdersCount / totalOrders) * 100) : 100;

  // Format course breakdown list sorted by revenue descending
  const courseBreakdown = Array.from(courseMap.entries())
    .map(([courseTitle, data]) => ({
      courseTitle,
      category: data.category,
      ordersCount: data.count,
      revenue: data.revenue,
      percentageOfTotal: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Format cohort breakdown
  const cohortBreakdown = Array.from(cohortMap.entries())
    .map(([schedule, ordersCount]) => ({ schedule, ordersCount }))
    .sort((a, b) => b.ordersCount - a.ordersCount);

  // Format payment method breakdown
  const paymentMethodBreakdown = Array.from(paymentMethodMap.entries())
    .map(([method, data]) => ({
      method,
      ordersCount: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalRevenue,
    totalOrders,
    paidOrdersCount,
    refundedOrdersCount,
    averageOrderValue,
    successRatePercent,
    todayRevenue,
    todayOrdersCount,
    thisMonthRevenue,
    thisMonthOrdersCount,
    courseBreakdown,
    cohortBreakdown,
    paymentMethodBreakdown,
  };
}

/**
 * Export course sales to standard CSV format and trigger browser download
 */
export function exportSalesToCsv(salesList: CourseSale[] = getAllSales()): void {
  const headers = [
    "Order ID",
    "Receipt Number",
    "Student Name",
    "Student Email",
    "Phone Number",
    "Course Title",
    "Category",
    "Cohort Schedule",
    "Amount (INR)",
    "Currency",
    "Payment Gateway ID",
    "Payment Method",
    "Payment Status",
    "Transaction Date",
    "Source",
    "Notes",
  ];

  const rows = salesList.map((s) => [
    `"${s.id}"`,
    `"${s.receiptNo}"`,
    `"${s.studentName.replace(/"/g, '""')}"`,
    `"${s.studentEmail}"`,
    `"${s.studentPhone}"`,
    `"${s.courseTitle.replace(/"/g, '""')}"`,
    `"${s.category}"`,
    `"${s.cohortSchedule.replace(/"/g, '""')}"`,
    s.amount,
    `"${s.currency}"`,
    `"${s.paymentId}"`,
    `"${s.paymentMethod}"`,
    `"${s.paymentStatus}"`,
    `"${s.dateFormatted}"`,
    `"${s.source}"`,
    `"${(s.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `SkilltoSettle_Course_Sales_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
