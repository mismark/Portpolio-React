import "./Footer.css";
import { FaHeart } from "react-icons/fa";
import { getPlatformMeta } from "../../utils/platformMeta";

const NAV_LINKS = [
  { label: "Home",     href: "#home"     },
  { label: "About",    href: "#about"    },
  { label: "Skills",   href: "#skills"   },
  { label: "Projects", href: "#projects" },
  { label: "Contact",  href: "#contact"  },
];

function Footer({ profile }) {
  const scrollTo = (href) =>
    document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });

  const name     = profile?.name     || "Mekuanint Misganaw";
  const email    = profile?.email    || "mismarkol903@gmail.com";
  const telegram = profile?.telegram || "https://t.me/mismarkol";
  const location = profile?.location || "Bahir Dar, Ethiopia";

  const socials = [
    { key: "github",   href: profile?.github   || "https://github.com/mismark" },
    { key: "linkedin", href: profile?.linkedin  || "https://linkedin.com"       },
    { key: "telegram", href: telegram                                            },
  ].filter((s) => s.href);

  // Derive display handle from telegram URL
  const telegramHandle = telegram.replace("https://t.me/", "@");

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <span className="footer-logo">
              {name.split(" ")[0]}<span>.</span>
            </span>
            <p>
              {profile?.title || "Full Stack Developer"} &amp; Information Systems
              student at Bahir Dar University. Building impactful web applications.
            </p>
            <div className="footer-socials">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={getPlatformMeta(s.key).label}
                  className="footer-social-btn"
                >
                  {getPlatformMeta(s.key).icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-nav">
            <h4>Quick Links</h4>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="footer-contact">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
              <li>
                <a href={telegram} target="_blank" rel="noopener noreferrer">
                  {telegramHandle}
                </a>
              </li>
              <li><span>{location}</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} {name}. Made with{" "}
            <FaHeart className="heart-icon" aria-hidden="true" /> using React &amp; Node.js
          </p>
          <a
            href="#home"
            className="back-top"
            onClick={(e) => { e.preventDefault(); scrollTo("#home"); }}
          >
            ↑ Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
