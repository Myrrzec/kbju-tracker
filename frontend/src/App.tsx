import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DiaryPage } from "./pages/DiaryPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LandingPage } from "./pages/LandingPage";
import { useAuth } from "./context/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        <Route path="/" element={isAuthenticated ? <Layout /> : <LandingPage />}>
          <Route index element={<DashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<Layout />}>
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
