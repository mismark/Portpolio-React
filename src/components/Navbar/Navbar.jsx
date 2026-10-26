import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";

const navLinks = [
  { label: "Home",         href: "#home"        },
  { label: "About",        href: "#about"        },
  { label: "Experience",   href: "#experience"   },
  { label: "Services",     href: "#services"     },
  { label: "Skills",       href: "#skills"       },
  { label: "Projects",     href: "#projects"     },
  { label: "Certificates", href: "#certificates" },
  { label: "Blog",         href: "/blog",  page: true },
  { label: "Contact",      href: "#contact"      },
];

function Navbar({ profile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active,   setActive]   = useState("home");
  const navigate  = useNavigate();
  const location  = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.35 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (location.pathname.startsWith("/blog")) setActive("blog");
  }, [location.pathname]);

  const handleLinkClick = (link) => {
    setMenuOpen(false);
    if (link.page) {
      navigate(link.href);
      return;
    }
    if (!isHome) {
      navigate("/");
      setTimeout(() => {
        const id = link.href.replace("#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const id = link.href.replace("#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isHome) {
      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const isLinkActive = (link) => {
    if (link.page) return location.pathname.startsWith(link.href);
    return active === link.href.replace("#", "");
  };

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <a href="/" className="nav-logo" onClick={handleLogoClick}>
          {profile?.name?.split(" ")[0] ?? "Mekuanint"}<span>.</span>
        </a>

        <nav className="nav-links">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={isLinkActive(link) ? "active" : ""}
              onClick={(e) => { e.preventDefault(); handleLinkClick(link); }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="btn-primary nav-cta"
          onClick={(e) => { e.preventDefault(); handleLinkClick({ href: "#contact" }); }}
        >
          Hire Me
        </a>

        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={isLinkActive(link) ? "active" : ""}
            onClick={(e) => { e.preventDefault(); handleLinkClick(link); }}
          >
            {link.label}
          </a>
        ))}
        <div className="mobile-bottom-row">
          <a
            href="#contact"
            className="btn-primary"
            onClick={(e) => { e.preventDefault(); handleLinkClick({ href: "#contact" }); }}
          >
            Hire Me
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
