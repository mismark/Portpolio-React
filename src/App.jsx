import { Routes, Route } from "react-router-dom";
import "./App.css";
import useProfile from "./hooks/useProfile";
import useDarkMode from "./hooks/useDarkMode";
import useSEO from "./hooks/useSEO";

// Portfolio sections
import Navbar       from "./components/Navbar/Navbar";
import Hero         from "./components/Hero/Hero";
import Socials      from "./components/Socials/Socials";
import Stats        from "./components/Stats/Stats";
import About        from "./components/About/About";
import Experience   from "./components/Experience/Experience";
import Services     from "./components/Services/Services";
import Skills       from "./components/Skills/Skills";
import Projects     from "./components/Projects/Projects";
import Certificates from "./components/Certificates/Certificates";
import Testimonials from "./components/Testimonials/Testimonials";
import Contact      from "./components/Contact/Contact";
import Footer       from "./components/Footer/Footer";

// Admin pages
import AdminLogin     from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./pages/Admin/ProtectedRoute";
import NotFound       from "./pages/NotFound";

// Blog pages
import BlogList from "./pages/Blog/BlogList";
import BlogPost from "./pages/Blog/BlogPost";

// AI Chat widget
import ChatWidget from "./components/ChatWidget/ChatWidget";

// Scroll-to-top button
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

// ── Public portfolio page ────────────────────────────────────────────────────
function Portfolio({ dark, onToggleDark }) {
  const { profile, loading } = useProfile();
  useSEO({
    title:       null, // uses site name as-is for home
    description: profile?.bio || undefined,
  });

  return (
    <>
      <Navbar profile={profile} dark={dark} onToggleDark={onToggleDark} />
      <main>
        <Hero         profile={profile} loading={loading} />
        <Socials      profile={profile} />
        <Stats        profile={profile} loading={loading} />
        <About        profile={profile} loading={loading} />
        <Experience   />
        <Services     />
        <Skills       profile={profile} />
        <Projects     />
        <Certificates />
        <Testimonials />
        <Contact      profile={profile} />
      </main>
      <Footer profile={profile} />
      <ChatWidget profile={profile} />
      <ScrollToTop />
    </>
  );
}

// ── Root with router ─────────────────────────────────────────────────────────
function App() {
  const { dark, toggle } = useDarkMode();

  return (
    <Routes>
      <Route path="/"  element={<Portfolio dark={dark} onToggleDark={toggle} />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/blog"       element={<BlogList dark={dark} onToggleDark={toggle} />} />
      <Route path="/blog/:slug" element={<BlogPost dark={dark} onToggleDark={toggle} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
