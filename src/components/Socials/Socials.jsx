import "./Socials.css";
import { getPlatformMeta } from "../../utils/platformMeta";

function Socials({ profile }) {
  const fixed = [
    { platform: "github",    href: profile?.github    },
    { platform: "linkedin",  href: profile?.linkedin  },
    { platform: "instagram", href: profile?.instagram },
    { platform: "telegram",  href: profile?.telegram  },
    { platform: "email",     href: profile?.email ? `mailto:${profile.email}` : null },
  ].filter((l) => l.href);

  const extras = (profile?.extraSocials || [])
    .filter((s) => s.platform && s.url)
    .map((s) => ({ platform: s.platform, href: s.url }));

  const allLinks = [...fixed, ...extras];

  return (
    <div className="socials-bar">
      <div className="container">
        <div className="socials-inner">
          <span className="socials-label">Follow me on</span>
          <div className="socials-links">
            {allLinks.map((link, i) => {
              const { icon, color, label } = getPlatformMeta(link.platform);
              return (
                <a
                  key={`${link.platform}-${i}`}
                  href={link.href}
                  target={link.href.startsWith("mailto") ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="social-btn"
                  style={{ "--hover-color": color }}
                  title={label}
                >
                  {icon}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Socials;
