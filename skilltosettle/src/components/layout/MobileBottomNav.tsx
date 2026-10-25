import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import styles from "./MobileBottomNav.module.css";

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // On course detail pages (/courses/:slug), StickyEnrollPanel renders its own sticky enrollment bottom bar
  const isCourseDetail = location.pathname.startsWith("/courses/") && location.pathname !== "/courses";
  if (isCourseDetail) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5L12 3l9 7.5v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "Courses",
      path: "/courses",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      label: "Live Classes",
      path: "/live-classes",
      badge: "LIVE",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      label: "Career",
      path: "/career-finder",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
    },
    {
      label: isAuthenticated && user ? (user.role === "Admin" ? "Admin" : "Student") : "Login",
      path: isAuthenticated ? (user?.role === "Admin" ? "/admin" : "/student") : "/login",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className={styles.bottomNav} aria-label="Mobile Navigation Bar">
      <div className={styles.navContainer}>
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path) ||
                (item.path === "/student" && (location.pathname === "/profile" || location.pathname.startsWith("/student"))) ||
                (item.path === "/admin" && location.pathname.startsWith("/admin"));

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.iconWrapper}>
                {item.icon}
                {item.badge && <span className={styles.liveDot}></span>}
              </div>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
