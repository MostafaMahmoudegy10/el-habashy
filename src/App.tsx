import { lazy, Suspense, useEffect } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Toast } from "./components/Toast";
import { AppProvider, useApp } from "./context/AppContext";
import { AboutPage } from "./pages/AboutPage";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { ListingDetailsPage } from "./pages/ListingDetailsPage";
import { ListingsPage } from "./pages/ListingsPage";
import { ServiceDetailsPage, ServicesPage } from "./pages/ServicesPage";
import { useAuth } from "./context/AuthContext";

const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));

function AppShell() {
  const { lang, page, navigate } = useApp();
  const { user, authLoading } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    if (!authLoading && page === "dashboard" && user?.role !== "ADMIN") navigate(user ? "home" : "login");
  }, [authLoading, navigate, page, user]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(180,133,47,0.12),transparent_34%),linear-gradient(180deg,#fffaf0_0%,#f8fafc_36%,#ffffff_100%)] font-sans text-slate-950 selection:bg-amber-200 selection:text-slate-950">
      <Header />
      <main>
        {page === "home" && <HomePage />}
        {page === "about" && <AboutPage />}
        {page === "listings" && <ListingsPage />}
        {page === "details" && <ListingDetailsPage />}
        {page === "services" && <ServicesPage />}
        {page === "service-details" && <ServiceDetailsPage />}
        {page === "login" && <AuthPage mode="login" />}
        {page === "register" && <AuthPage mode="register" />}
        {page === "dashboard" && user?.role === "ADMIN" && (
          <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-sm font-black text-slate-600">{lang === "ar" ? "جاري فتح لوحة التحكم..." : "Opening dashboard..."}</div>}>
            <DashboardPage />
          </Suspense>
        )}
      </main>
      <Footer />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
