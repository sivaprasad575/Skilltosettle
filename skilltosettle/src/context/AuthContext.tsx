import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  email: string;
  name: string;
  role: "Admin" | "Student";
}

export interface AdminCredentials {
  email: string;
  password: string;
  name: string;
  updatedAt?: string;
}

export interface StoredStudent {
  email: string;
  password: string;
  name: string;
}

export const DEFAULT_ADMIN_CREDS: AdminCredentials = {
  email: "info@skilltosettle.com",
  password: "SkilltoSettle@Admin2025",
  name: "Administrator",
};

const STORAGE_USER_KEY = "skillsettle_user";
const STORAGE_ADMIN_CREDS_KEY = "skillsettle_admin_creds";
const STORAGE_STUDENTS_KEY = "skillsettle_registered_users";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, name?: string, role?: "Admin" | "Student") => void;
  logout: () => void;
  getAdminCredentials: () => AdminCredentials;
  getRegisteredStudents: () => StoredStudent[];
  updateAdminCredentials: (creds: { email?: string; password?: string; name?: string }) => { success: boolean; message: string };
  updateStudentCredentials: (email: string, creds: { name?: string; password?: string }) => { success: boolean; message: string };
  loginWithCredentials: (email: string, password: string, targetRole: "Admin" | "Student") => { success: boolean; error?: string; user?: User };
  registerStudent: (name: string, email: string, password: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  getAdminCredentials: () => DEFAULT_ADMIN_CREDS,
  getRegisteredStudents: () => [],
  updateAdminCredentials: () => ({ success: false, message: "" }),
  updateStudentCredentials: () => ({ success: false, message: "" }),
  loginWithCredentials: () => ({ success: false }),
  registerStudent: () => ({ success: false }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize stored active session
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name === "Demo Student") {
          parsed.name = "Student";
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(parsed));
        }
        if (parsed?.role === "Admin" && parsed?.email === "admin@skilltosettle.com") {
          parsed.email = "info@skilltosettle.com";
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(parsed));
        }
        setUser(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Helper to get current admin credentials (defaults or customized)
  const getAdminCredentials = (): AdminCredentials => {
    try {
      const stored = localStorage.getItem(STORAGE_ADMIN_CREDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.password === "Admin@123" || parsed?.email === "admin@skilltosettle.com") {
          parsed.password = DEFAULT_ADMIN_CREDS.password;
          parsed.email = DEFAULT_ADMIN_CREDS.email;
          localStorage.setItem(STORAGE_ADMIN_CREDS_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_ADMIN_CREDS;
  };

  // Helper to get registered students list (only real accounts registered via /register)
  const getRegisteredStudents = (): StoredStudent[] => {
    try {
      const stored = localStorage.getItem(STORAGE_STUDENTS_KEY);
      if (stored) {
        const parsed: StoredStudent[] = JSON.parse(stored);
        // Filter out any legacy dummy/demo student accounts
        const real = parsed.filter(
          (s) => s.email.toLowerCase() !== "student@skilltosettle.com"
        );
        if (real.length !== parsed.length) {
          localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(real));
        }
        return real;
      }
    } catch {
      // fallback
    }
    return [];
  };

  // Direct login helper (backwards compatibility)
  const login = (email: string, name?: string, role: "Admin" | "Student" = "Student") => {
    const defaultName = name || email.split("@")[0] || "User";
    const loggedUser: User = { email, name: defaultName, role };
    setUser(loggedUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedUser));
  };

  // Authenticate with Email & Password based on role
  const loginWithCredentials = (
    email: string,
    password: string,
    targetRole: "Admin" | "Student"
  ): { success: boolean; error?: string; user?: User } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (targetRole === "Admin") {
      const adminCreds = getAdminCredentials();
      if (
        cleanEmail === adminCreds.email.toLowerCase() &&
        cleanPass === adminCreds.password
      ) {
        const adminUser: User = {
          email: adminCreds.email,
          name: adminCreds.name || "Administrator",
          role: "Admin",
        };
        setUser(adminUser);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }
      return {
        success: false,
        error: "Invalid Admin email or password. Please verify your credentials.",
      };
    }

    // Student / Customer Login
    const students = getRegisteredStudents();
    const matched = students.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!matched) {
      return {
        success: false,
        error: "No account found with this email. Please register first to create your student account.",
      };
    }

    if (matched.password === cleanPass) {
      const studentUser: User = {
        email: matched.email,
        name: matched.name,
        role: "Student",
      };
      setUser(studentUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(studentUser));
      return { success: true, user: studentUser };
    } else {
      return {
        success: false,
        error: "Incorrect password for this student account. Please verify and try again.",
      };
    }
  };

  // Register a new student explicitly
  const registerStudent = (name: string, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const students = getRegisteredStudents();

    if (students.some((s) => s.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "An account with this email already exists. Please log in." };
    }

    const newStudent: StoredStudent = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    };
    students.push(newStudent);
    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(students));

    const studentUser: User = {
      email: newStudent.email,
      name: newStudent.name,
      role: "Student",
    };
    setUser(studentUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(studentUser));
    return { success: true };
  };

  // Update Admin credentials so admin can change email/password anytime
  const updateAdminCredentials = (newCreds: { email?: string; password?: string; name?: string }) => {
    const current = getAdminCredentials();
    const updated: AdminCredentials = {
      email: newCreds.email ? newCreds.email.trim() : current.email,
      password: newCreds.password ? newCreds.password.trim() : current.password,
      name: newCreds.name ? newCreds.name.trim() : current.name,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_ADMIN_CREDS_KEY, JSON.stringify(updated));

    // If currently logged in as admin, update active session
    if (user && user.role === "Admin") {
      const updatedUser: User = {
        email: updated.email,
        name: updated.name,
        role: "Admin",
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
    }

    return {
      success: true,
      message: "Admin credentials successfully updated! Your new login details are active.",
    };
  };

  // Update student password and profile details
  const updateStudentCredentials = (
    email: string,
    newDetails: { name?: string; password?: string }
  ) => {
    const students = getRegisteredStudents();
    const idx = students.findIndex((s) => s.email.toLowerCase() === email.trim().toLowerCase());
    if (idx >= 0) {
      if (newDetails.name && newDetails.name.trim()) {
        students[idx].name = newDetails.name.trim();
      }
      if (newDetails.password && newDetails.password.trim()) {
        students[idx].password = newDetails.password.trim();
      }
      localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(students));

      // If active session belongs to this student, update session
      if (user && user.email.toLowerCase() === email.trim().toLowerCase()) {
        const updatedUser: User = {
          ...user,
          name: students[idx].name,
        };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
      }

      return {
        success: true,
        message: "Your profile & password have been successfully updated!",
      };
    }

    return {
      success: false,
      message: "Student account not found.",
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "Admin",
        login,
        logout,
        getAdminCredentials,
        getRegisteredStudents,
        updateAdminCredentials,
        updateStudentCredentials,
        loginWithCredentials,
        registerStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
