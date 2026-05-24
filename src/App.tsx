import { AuthModal } from "./components/AuthModal";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Toast } from "./components/Toast";
import { AppProvider, useApp } from "./context/AppContext";
import { AboutPage } from "./pages/AboutPage";
import { ComparePage } from "./pages/ComparePage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { ListingsPage } from "./pages/ListingsPage";

function AppShell() {
  const { page } = useApp();

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-950 selection:bg-amber-200 selection:text-slate-950">
      <Header />
      <main>
        {page === "home" && <HomePage />}
        {page === "listings" && <ListingsPage />}
        {page === "about" && <AboutPage />}
        {page === "compare" && <ComparePage />}
        {page === "dashboard" && <DashboardPage />}
      </main>
      <Footer />
      <AuthModal />
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
