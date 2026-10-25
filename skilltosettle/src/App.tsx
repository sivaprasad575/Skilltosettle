import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

// Pages
import Home from "@/pages/Home";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import CareerPaths from "@/pages/CareerPaths";
import CareerPathDetail from "@/pages/CareerPathDetail";
import LiveClasses from "@/pages/LiveClasses";
import CareerFinder from "@/pages/CareerFinder";
import SuccessStories from "@/pages/SuccessStories";
import Corporate from "@/pages/Corporate";
import Instructors from "@/pages/Instructors";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import RefundPolicy from "@/pages/RefundPolicy";
import CertificateGenerator from "@/pages/CertificateGenerator";
import CertificateVerification from "@/pages/CertificateVerification";
import Profile from "@/pages/Profile";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ flex: 1 }} className="main-content-wrapper">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:slug" element={<CourseDetail />} />
                <Route path="/career-paths" element={<CareerPaths />} />
                <Route path="/career-paths/:slug" element={<CareerPathDetail />} />
                <Route path="/live-classes" element={<LiveClasses />} />
                <Route path="/career-finder" element={<CareerFinder />} />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/corporate" element={<Corporate />} />
                <Route path="/instructors" element={<Instructors />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/verify" element={<CertificateVerification />} />
                <Route path="/verify/:id" element={<CertificateVerification />} />
                <Route path="/certificate/:id" element={<CertificateVerification />} />
                <Route path="/certificate/private/:id" element={<CertificateVerification />} />
                <Route path="/admin" element={<CertificateGenerator />} />
                <Route path="/admin/sales" element={<CertificateGenerator />} />
                <Route path="/admin/portal" element={<CertificateGenerator />} />
                <Route path="/admin/certificates" element={<CertificateGenerator />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/profile" element={<Profile />} />
                <Route path="/student" element={<Profile />} />
                <Route path="/student/login" element={<Login />} />
                <Route path="/student/profile" element={<Profile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/log" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reg" element={<Register />} />
                {/* Fallback route */}
                <Route path="*" element={<Home />} />
              </Routes>
            </div>
            <Footer />
            <WhatsAppButton />
            <MobileBottomNav />
          </div>
        </BrowserRouter>
      </CurrencyProvider>
    </AuthProvider>
  );
}
