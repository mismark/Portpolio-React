import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Blog.css";
import Navbar  from "../../components/Navbar/Navbar";
import Footer  from "../../components/Footer/Footer";
import useProfile from "../../hooks/useProfile";
import useSEO from "../../hooks/useSEO";
import {
  FaCalendarAlt, FaClock, FaEye, FaTag,
  FaArrowLeft, FaShare,
} from "react-icons/fa";

/* ── Reading progress bar ──────────────────────────────────────────────────── */
function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement;
      const top = el.scrollTop  || document.body.scrollTop;
      const h   = el.scrollHeight - el.clientHeight;
      setPct(h > 0 ? Math.min(100, (top / h) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="reading-progress-track" aria-hidden="true">
      <div className="reading-progress-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// Very simple Markdown-like renderer — converts headings, bold, lists, code blocks
function renderContent(text = "") {
  return text
    .split("\n")
    .map((line, i) => {
      if (/^### (.+)/.test(line)) return <h3 key={i} className="post-content-h3">{line.replace(/^### /, "")}</h3>;
      if (/^## (.+)/.test(line))  return <h2 key={i} className="post-content-h2">{line.replace(/^## /, "")}</h2>;
      if (/^# (.+)/.test(line))   return <h1 key={i} className="post-content-h1">{line.replace(/^# /, "")}</h1>;
      if (/^- (.+)/.test(line))   return <li key={i} className="post-content-li">{line.replace(/^- /, "")}</li>;
      if (/^```/.test(line))      return <div key={i} className="post-content-code-fence" />;
      if (line.trim() === "")     return <br key={i} />;

      // Bold **text**
      const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      // Inline code `text`
      const coded = bold.replace(/`(.+?)`/g, '<code class="post-inline-code">$1</code>');

      return (
        <p
          key={i}
          className="post-content-p"
          dangerouslySetInnerHTML={{ __html: coded }}
        />
      );
    });
}

function BlogPost() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied]   = useState(false);
  const { profile } = useProfile();

  const API_BASE = import.meta.env.VITE_API_URL || "";

  // SEO — updates whenever post loads
  const ogImage = post?.coverImage
    ? (post.coverImage.startsWith("/uploads") ? `${API_BASE}${post.coverImage}` : post.coverImage)
    : undefined;
  useSEO({
    title:       post?.title,
    description: post?.excerpt,
    image:       ogImage,
    type:        "article",
  });

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/posts/${slug}`)
      .then((res) => setPost(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <>
        <Navbar profile={profile} />
        <div className="blog-page">
          <div className="container post-skeleton-page">
            <div className="post-skeleton" style={{ height: 320 }} />
            <div className="post-skeleton" style={{ height: 40, marginTop: 24 }} />
            <div className="post-skeleton" style={{ height: 20, marginTop: 12 }} />
            <div className="post-skeleton" style={{ height: 20, marginTop: 8 }} />
          </div>
        </div>
        <Footer profile={profile} />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Navbar profile={profile} />
        <div className="blog-page">
          <div className="container post-not-found">
            <h1>404</h1>
            <p>This article doesn't exist or has been removed.</p>
            <Link to="/blog" className="btn-primary">← Back to Blog</Link>
          </div>
        </div>
        <Footer profile={profile} />
      </>
    );
  }

  return (
    <>
      <ReadingProgress />
      <Navbar profile={profile} />

      <div className="blog-page">
        {/* Cover */}
        {post.coverImage ? (
          <div className="post-detail-cover">
            <img
              src={post.coverImage.startsWith("/uploads") ? `${API_BASE}${post.coverImage}` : post.coverImage}
              alt={post.title}
            />
            <div className="post-detail-cover-overlay" />
          </div>
        ) : (
          <div className="post-detail-cover post-detail-cover-gradient" />
        )}

        <div className="container post-detail-wrap">
          {/* Back link */}
          <Link to="/blog" className="post-back">
            <FaArrowLeft /> Back to Blog
          </Link>

          {/* Article header */}
          <header className="post-detail-header">
            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="post-tag">
                    <FaTag /> {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="post-detail-title">{post.title}</h1>
            <p className="post-detail-excerpt">{post.excerpt}</p>

            {/* Meta row */}
            <div className="post-detail-meta">
              <span><FaCalendarAlt /> {formatDate(post.createdAt)}</span>
              <span><FaClock /> {post.readTime} min read</span>
              <span><FaEye /> {post.views} views</span>

              {/* Share button */}
              <button className="share-btn" onClick={handleShare}>
                <FaShare /> {copied ? "Copied!" : "Share"}
              </button>
            </div>
          </header>

          {/* Article content */}
          <div className="post-content">
            {renderContent(post.content)}
          </div>

          {/* Footer nav */}
          <div className="post-detail-footer">
            <Link to="/blog" className="btn-outline post-back-btn">
              <FaArrowLeft /> More Articles
            </Link>
          </div>
        </div>
      </div>

      <Footer profile={profile} />
    </>
  );
}

export default BlogPost;
