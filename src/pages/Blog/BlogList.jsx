import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Blog.css";
import Navbar  from "../../components/Navbar/Navbar";
import Footer  from "../../components/Footer/Footer";
import useProfile from "../../hooks/useProfile";
import useSEO from "../../hooks/useSEO";
import {
  FaCalendarAlt, FaClock, FaEye, FaTag, FaSearch,
  FaArrowRight,
} from "react-icons/fa";

const FALLBACK = [
  {
    _id: "b1",
    title: "Getting Started with React and Node.js",
    slug:  "getting-started-react-nodejs",
    excerpt: "A beginner-friendly guide to building full-stack web applications using React for the frontend and Node.js with Express for the backend.",
    tags: ["React", "Node.js", "Full Stack"],
    readTime: 5,
    views: 120,
    published: true,
    createdAt: new Date("2024-03-15").toISOString(),
    coverImage: "",
  },
  {
    _id: "b2",
    title: "Understanding MongoDB Schema Design",
    slug:  "mongodb-schema-design",
    excerpt: "Learn the key principles of designing efficient MongoDB schemas — embedding vs referencing, indexing strategies, and real-world examples.",
    tags: ["MongoDB", "Database", "Backend"],
    readTime: 7,
    views: 85,
    published: true,
    createdAt: new Date("2024-04-02").toISOString(),
    coverImage: "",
  },
  {
    _id: "b3",
    title: "CSS Tips Every Developer Should Know",
    slug:  "css-tips-developers",
    excerpt: "Practical CSS techniques to write cleaner, more maintainable stylesheets — from custom properties to modern layout tricks.",
    tags: ["CSS", "Frontend", "Tips"],
    readTime: 4,
    views: 200,
    published: true,
    createdAt: new Date("2024-05-10").toISOString(),
    coverImage: "",
  },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function PostCard({ post }) {
  const API_BASE = import.meta.env.VITE_API_URL || "";

  return (
    <article className="post-card">
      {/* Cover image */}
      {post.coverImage ? (
        <div className="post-cover">
          <img
            src={post.coverImage.startsWith("/uploads") ? `${API_BASE}${post.coverImage}` : post.coverImage}
            alt={post.title}
          />
        </div>
      ) : (
        <div className="post-cover post-cover-placeholder">
          <span>{post.title.charAt(0)}</span>
        </div>
      )}

      <div className="post-body">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="post-tag">
                <FaTag /> {tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="post-title">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>

        <p className="post-excerpt">{post.excerpt}</p>

        {/* Meta */}
        <div className="post-meta">
          <span><FaCalendarAlt /> {formatDate(post.createdAt)}</span>
          <span><FaClock /> {post.readTime} min read</span>
          <span><FaEye /> {post.views} views</span>
        </div>

        <Link to={`/blog/${post.slug}`} className="post-read-more">
          Read More <FaArrowRight />
        </Link>
      </div>
    </article>
  );
}

function BlogList({ dark, onToggleDark }) {
  const [posts, setPosts]       = useState(FALLBACK);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const { profile } = useProfile();
  useSEO({ title: "Blog", description: "Thoughts on web development, tech, and things I've learned building software." });

  useEffect(() => {
    axios.get("/api/posts")
      .then((res) => { if (res.data?.data?.length) setPosts(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Collect all unique tags
  const allTags = ["All", ...new Set(posts.flatMap((p) => p.tags || []))];

  // Filter by search + tag
  const filtered = posts.filter((p) => {
    const matchTag    = activeTag === "All" || p.tags?.includes(activeTag);
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <>
      <Navbar profile={profile} dark={dark} onToggleDark={onToggleDark} />

      <div className="blog-page">
        {/* Hero banner */}
        <div className="blog-hero">
          <div className="container">
            <h1 className="blog-hero-title">Blog</h1>
            <p className="blog-hero-sub">
              Thoughts on web development, tech, and things I've learned building software.
            </p>

            {/* Search */}
            <div className="blog-search-wrap">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search articles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="blog-search"
              />
            </div>
          </div>
        </div>

        <div className="container blog-body">
          {/* Tag filter */}
          <div className="blog-tags-filter">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tag-filter-btn${activeTag === tag ? " active" : ""}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="blog-skeleton">
              {[...Array(3)].map((_, i) => <div key={i} className="post-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="blog-empty">
              <p>No articles found{search ? ` for "${search}"` : ""}.</p>
            </div>
          ) : (
            <>
              <p className="blog-count">{filtered.length} article{filtered.length !== 1 ? "s" : ""}</p>
              <div className="posts-grid">
                {filtered.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer profile={profile} />
    </>
  );
}

export default BlogList;
