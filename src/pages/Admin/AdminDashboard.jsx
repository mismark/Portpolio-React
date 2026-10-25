import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";
import {
  FaPlus, FaTrash, FaSignOutAlt, FaExternalLinkAlt,
  FaGithub, FaStar, FaRegStar, FaCode, FaPencilAlt,
  FaTimes, FaCheck, FaDatabase, FaUser, FaEnvelope,
  FaLayerGroup, FaCamera, FaLock, FaEye, FaEyeSlash,
  FaCheckCircle, FaRegCircle, FaFilePdf, FaKeyboard,
  FaBriefcase, FaTools, FaCertificate, FaQuoteRight,
  FaMapMarkerAlt, FaNewspaper, FaGlobe, FaEdit,
  FaToggleOn, FaToggleOff, FaImage,
} from "react-icons/fa";
import PlatformPicker from "./PlatformPicker";
import { getPlatformMeta } from "../../utils/platformMeta";

// ─── Constants ───────────────────────────────────────────────────────────────

const EMPTY_PROJECT = {
  title: "", description: "", techStack: "",
  github: "", live: "", featured: false, order: 0,
};

const EMPTY_PROFILE = {
  name: "", title: "", bio: "", email: "",
  phone: "", location: "",
  github: "", linkedin: "", telegram: "", instagram: "",
  extraSocials: [],
  // skills is [{name, level}] — managed as an array in state
  skills: [],
  // heroTitles as newline-separated text in the textarea
  heroTitles: "",
  statsYears: 1, statsProjects: 5, statsSkills: 12,
};

const EMPTY_PW = { currentPassword: "", newPassword: "", confirmPassword: "" };

function authApi(token) {
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL || "",
    headers: { Authorization: `Bearer ${token}` },
  });
}

function Field({ label, hint, children }) {
  return (
    <div className="form-group">
      <label>{label}{hint && <span className="hint"> ({hint})</span>}</label>
      {children}
    </div>
  );
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("admin_token");
  const photoRef = useRef(null);
  const cvRef    = useRef(null);

  const [activeTab, setActiveTab] = useState("projects");

  // ── Projects ──
  const [projects,        setProjects]       = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [addForm,         setAddForm]         = useState(EMPTY_PROJECT);
  const [addError,        setAddError]        = useState("");
  const [addSuccess,      setAddSuccess]      = useState("");
  const [submitting,      setSubmitting]      = useState(false);
  const [deletingId,      setDeletingId]      = useState(null);
  const [editId,          setEditId]          = useState(null);
  const [editForm,        setEditForm]        = useState({});
  const [editSaving,      setEditSaving]      = useState(false);
  const [seedLoading,     setSeedLoading]     = useState(false);
  const [seedMsg,         setSeedMsg]         = useState(null);

  // ── Messages ──
  const [messages,        setMessages]        = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [deletingMsgId,   setDeletingMsgId]   = useState(null);
  const [togglingMsgId,   setTogglingMsgId]   = useState(null);

  // ── Profile ──
  const [profileForm,    setProfileForm]    = useState(EMPTY_PROFILE);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileMsg,     setProfileMsg]     = useState(null);
  const [photoPreview,   setPhotoPreview]   = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [cvName,         setCvName]         = useState("");
  const [cvUploading,    setCvUploading]    = useState(false);

  // ── Password ──
  const [pwForm,  setPwForm]  = useState(EMPTY_PW);
  const [pwMsg,   setPwMsg]   = useState(null);
  const [pwSaving,setPwSaving]= useState(false);
  const [showPw,  setShowPw]  = useState({ current: false, new: false, confirm: false });

  // ── Experience ──
  const EMPTY_EXP = { type: "work", title: "", organization: "", location: "", startDate: "", endDate: "Present", current: false, description: "", order: 0 };
  const [expItems,      setExpItems]      = useState([]);
  const [expForm,       setExpForm]       = useState(EMPTY_EXP);
  const [expSubmitting, setExpSubmitting] = useState(false);
  const [expMsg,        setExpMsg]        = useState(null);
  const [deletingExpId, setDeletingExpId] = useState(null);

  // ── Services ──
  const EMPTY_SVC = { title: "", description: "", icon: "FaCode", features: "", price: "", order: 0 };
  const [svcItems,      setSvcItems]      = useState([]);
  const [svcForm,       setSvcForm]       = useState(EMPTY_SVC);
  const [svcSubmitting, setSvcSubmitting] = useState(false);
  const [svcMsg,        setSvcMsg]        = useState(null);
  const [deletingSvcId, setDeletingSvcId] = useState(null);

  // ── Certificates ──
  const EMPTY_CERT = { title: "", issuer: "", date: "", credentialUrl: "", order: 0 };
  const [certItems,       setCertItems]       = useState([]);
  const [certForm,        setCertForm]        = useState(EMPTY_CERT);
  const [certSubmitting,  setCertSubmitting]  = useState(false);
  const [certMsg,         setCertMsg]         = useState(null);
  const [deletingCertId,  setDeletingCertId]  = useState(null);
  const [certImgUploading,setCertImgUploading]= useState(null); // cert _id being uploaded
  const certImgRefs = useRef({});  // map of cert._id → <input> ref

  // ── Testimonials ──
  const EMPTY_TEST = { name: "", role: "", message: "", rating: 5, order: 0 };
  const [testItems,       setTestItems]       = useState([]);
  const [testForm,        setTestForm]        = useState(EMPTY_TEST);
  const [testSubmitting,  setTestSubmitting]  = useState(false);
  const [testMsg,         setTestMsg]         = useState(null);
  const [deletingTestId,  setDeletingTestId]  = useState(null);

  // ── Blog posts ──
  const EMPTY_POST = { title: "", slug: "", excerpt: "", content: "", tags: "", published: false };
  const [postItems,       setPostItems]       = useState([]);
  const [postForm,        setPostForm]        = useState(EMPTY_POST);
  const [postSubmitting,  setPostSubmitting]  = useState(false);
  const [postMsg,         setPostMsg]         = useState(null);
  const [deletingPostId,  setDeletingPostId]  = useState(null);
  const [editingPost,     setEditingPost]     = useState(null);
  const [editPostForm,    setEditPostForm]    = useState({});
  const [editPostSaving,  setEditPostSaving]  = useState(false);
  const [thumbUploading,  setThumbUploading]  = useState(null); // post _id being uploaded
  const thumbInputRefs = useRef({});  // map of post._id → <input> ref

  // ─── Auto-logout on 401 ──────────────────────────────────────────────────
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (r) => r,
      (err) => {
        // Only auto-logout if the 401 came from a protected route,
        // never from the login endpoint itself
        const url = err.config?.url || "";
        const isAuthUrl = url.includes("/api/auth/login");
        if (err.response?.status === 401 && !isAuthUrl) {
          localStorage.removeItem("admin_token");
          navigate("/admin");
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, [navigate]);

  // ─── Fetch helpers ────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await axios.get("/api/projects");
      setProjects(res.data.data || []);
    } finally { setLoadingProjects(false); }
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const res = await authApi(token).get("/api/contact");
      setMessages(res.data.data || []);
    } catch { /* ignore */ }
    finally { setLoadingMessages(false); }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await axios.get("/api/profile");
      const p   = res.data.data;
      if (!p) return;

      // skills arrives as [{name, level}] — keep as-is in state
      const skills = Array.isArray(p.skills)
        ? p.skills.map((s) =>
            typeof s === "string"
              ? { name: s, level: 70 }
              : { name: s.name || "", level: s.level ?? 70 }
          )
        : [];

      setProfileForm({
        name:          p.name          || "",
        title:         p.title         || "",
        bio:           p.bio           || "",
        email:         p.email         || "",
        phone:         p.phone         || "",
        location:      p.location      || "",
        github:        p.github        || "",
        linkedin:      p.linkedin      || "",
        telegram:      p.telegram      || "",
        instagram:     p.instagram     || "",
        extraSocials:  p.extraSocials  || [],
        skills,
        // heroTitles as one-per-line textarea text
        heroTitles:    (p.heroTitles   || []).join("\n"),
        statsYears:    p.stats?.yearsExperience   || 1,
        statsProjects: p.stats?.projectsCompleted || 5,
        statsSkills:   p.stats?.skillsCount       || 12,
      });

      if (p.photo) setPhotoPreview(p.photo);
      if (p.cv)    setCvName(p.cv.split("/").pop());
    } finally { setLoadingProfile(false); }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchMessages();
    fetchProfile();
  }, [fetchProjects, fetchMessages, fetchProfile]);

  // Fetch new sections on mount
  useEffect(() => {
    const load = async () => {
      try { const r = await axios.get("/api/experience");   setExpItems(r.data.data   || []); } catch {}
      try { const r = await axios.get("/api/services");     setSvcItems(r.data.data   || []); } catch {}
      try { const r = await axios.get("/api/certificates"); setCertItems(r.data.data  || []); } catch {}
      try { const r = await axios.get("/api/testimonials"); setTestItems(r.data.data  || []); } catch {}
      try { const r = await authApi(token).get("/api/posts/all"); setPostItems(r.data.data || []); } catch {}
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  // ─── Messages ─────────────────────────────────────────────────────────────

  const handleToggleRead = async (msg) => {
    setTogglingMsgId(msg._id);
    try {
      const res = await authApi(token).patch(`/api/contact/${msg._id}/read`, { read: !msg.read });
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? res.data.data : m)));
    } catch { /* ignore */ }
    finally { setTogglingMsgId(null); }
  };

  const handleDeleteMsg = async (id) => {
    if (!window.confirm("Delete this message permanently?")) return;
    setDeletingMsgId(id);
    try {
      await authApi(token).delete(`/api/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) { alert(err.response?.data?.message || "Delete failed."); }
    finally { setDeletingMsgId(null); }
  };

  // ─── Projects ─────────────────────────────────────────────────────────────

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError(""); setAddSuccess(""); setSubmitting(true);
    try {
      await authApi(token).post("/api/projects", {
        ...addForm,
        techStack: addForm.techStack.split(",").map((t) => t.trim()).filter(Boolean),
        order: Number(addForm.order) || 0,
      });
      setAddSuccess("Project added!");
      setAddForm(EMPTY_PROJECT);
      fetchProjects();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add project.");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      await authApi(token).delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) { alert(err.response?.data?.message || "Delete failed."); }
    finally { setDeletingId(null); }
  };

  const handleToggleFeatured = async (project) => {
    try {
      const res = await authApi(token).put(`/api/projects/${project._id}`, { featured: !project.featured });
      setProjects((prev) => prev.map((p) => (p._id === project._id ? res.data.data : p)));
    } catch { /* ignore */ }
  };

  const startEdit = (project) => {
    setEditId(project._id);
    setEditForm({
      title:       project.title       || "",
      description: project.description || "",
      techStack:   (project.techStack  || []).join(", "),
      github:      project.github      || "",
      live:        project.live        || "",
      featured:    project.featured    || false,
      order:       project.order       || 0,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const saveEdit = async (id) => {
    setEditSaving(true);
    try {
      const res = await authApi(token).put(`/api/projects/${id}`, {
        ...editForm,
        techStack: editForm.techStack.split(",").map((t) => t.trim()).filter(Boolean),
        order: Number(editForm.order) || 0,
      });
      setProjects((prev) => prev.map((p) => (p._id === id ? res.data.data : p)));
      setEditId(null);
    } catch (err) { alert(err.response?.data?.message || "Update failed."); }
    finally { setEditSaving(false); }
  };

  const handleSeed = async (force = false) => {
    if (force && !window.confirm("Wipe all projects and reseed defaults?")) return;
    setSeedLoading(true); setSeedMsg(null);
    try {
      const res = await authApi(token).post("/api/seed", { force });
      setSeedMsg({ type: res.data.success ? "success" : "error", text: res.data.message });
      if (res.data.success) fetchProjects();
    } catch (err) {
      setSeedMsg({ type: "error", text: err.response?.data?.message || "Seed failed." });
    } finally { setSeedLoading(false); }
  };

  // ─── Profile — photo ──────────────────────────────────────────────────────

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const res = await authApi(token).post("/api/profile/photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoPreview(res.data.photo);
      setProfileMsg({ type: "success", text: "Photo updated!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.message || "Photo upload failed." });
    } finally { setPhotoUploading(false); }
  };

  // ─── Profile — CV ──────────────────────────────────────────────────────────

  const handleCvChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvUploading(true);
    const fd = new FormData();
    fd.append("cv", file);
    try {
      const res = await authApi(token).post("/api/profile/cv", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCvName(res.data.cv.split("/").pop());
      setProfileMsg({ type: "success", text: "CV uploaded! Visitors can now download it." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.message || "CV upload failed." });
    } finally { setCvUploading(false); }
  };

  // ─── Profile — text fields ────────────────────────────────────────────────

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((f) => ({ ...f, [name]: value }));
  };

  // Extra socials
  const addSocial = () =>
    setProfileForm((f) => ({ ...f, extraSocials: [...f.extraSocials, { platform: "", url: "" }] }));

  const updateSocial = (i, field, value) =>
    setProfileForm((f) => ({
      ...f,
      extraSocials: f.extraSocials.map((s, idx) => idx === i ? { ...s, [field]: value } : s),
    }));

  const removeSocial = (i) =>
    setProfileForm((f) => ({ ...f, extraSocials: f.extraSocials.filter((_, idx) => idx !== i) }));

  // Skills — [{name, level}]
  const addSkill = () =>
    setProfileForm((f) => ({ ...f, skills: [...f.skills, { name: "", level: 70 }] }));

  const updateSkill = (i, field, value) =>
    setProfileForm((f) => ({
      ...f,
      skills: f.skills.map((s, idx) =>
        idx === i ? { ...s, [field]: field === "level" ? Math.min(100, Math.max(0, Number(value))) : value } : s
      ),
    }));

  const removeSkill = (i) =>
    setProfileForm((f) => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null); setProfileSaving(true);
    try {
      await authApi(token).put("/api/profile", {
        name:         profileForm.name,
        title:        profileForm.title,
        bio:          profileForm.bio,
        email:        profileForm.email,
        phone:        profileForm.phone,
        location:     profileForm.location,
        github:       profileForm.github,
        linkedin:     profileForm.linkedin,
        telegram:     profileForm.telegram,
        instagram:    profileForm.instagram,
        extraSocials: profileForm.extraSocials.filter((s) => s.platform && s.url),
        // Send as [{name, level}] — filter out empty rows
        skills:       profileForm.skills.filter((s) => s.name.trim()),
        // Split textarea lines into array, strip blanks
        heroTitles:   profileForm.heroTitles
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        stats: {
          yearsExperience:   Number(profileForm.statsYears)    || 1,
          projectsCompleted: Number(profileForm.statsProjects) || 5,
          skillsCount:       Number(profileForm.statsSkills)   || 12,
        },
      });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.message || "Update failed." });
    } finally { setProfileSaving(false); }
  };

  // ─── Password ─────────────────────────────────────────────────────────────

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((f) => ({ ...f, [name]: value }));
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return setPwMsg({ type: "error", text: "New passwords do not match." });
    if (pwForm.newPassword.length < 6)
      return setPwMsg({ type: "error", text: "Password must be at least 6 characters." });
    setPwSaving(true);
    try {
      const res = await authApi(token).put("/api/auth/password", {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      setPwMsg({ type: "success", text: res.data.message });
      setPwForm(EMPTY_PW);
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.message || "Password change failed." });
    } finally { setPwSaving(false); }
  };

  // ─── Experience handlers ─────────────────────────────────────────────────
  const handleExpChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExpForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const handleExpSubmit = async (e) => {
    e.preventDefault(); setExpMsg(null); setExpSubmitting(true);
    try {
      const res = await authApi(token).post("/api/experience", expForm);
      setExpItems((prev) => [...prev, res.data.data]);
      setExpForm({ type: "work", title: "", organization: "", location: "", startDate: "", endDate: "Present", current: false, description: "", order: 0 });
      setExpMsg({ type: "success", text: "Experience added!" });
    } catch (err) { setExpMsg({ type: "error", text: err.response?.data?.message || "Failed." }); }
    finally { setExpSubmitting(false); }
  };
  const handleExpDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    setDeletingExpId(id);
    try {
      await authApi(token).delete(`/api/experience/${id}`);
      setExpItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) { alert(err.response?.data?.message || "Delete failed."); }
    finally { setDeletingExpId(null); }
  };

  // ─── Services handlers ────────────────────────────────────────────────────
  const handleSvcChange = (e) => {
    const { name, value } = e.target;
    setSvcForm((f) => ({ ...f, [name]: value }));
  };
  const handleSvcSubmit = async (e) => {
    e.preventDefault(); setSvcMsg(null); setSvcSubmitting(true);
    try {
      const res = await authApi(token).post("/api/services", {
        ...svcForm,
        features: svcForm.features.split("\n").map((f) => f.trim()).filter(Boolean),
        order: Number(svcForm.order) || 0,
      });
      setSvcItems((prev) => [...prev, res.data.data]);
      setSvcForm({ title: "", description: "", icon: "FaCode", features: "", price: "", order: 0 });
      setSvcMsg({ type: "success", text: "Service added!" });
    } catch (err) { setSvcMsg({ type: "error", text: err.response?.data?.message || "Failed." }); }
    finally { setSvcSubmitting(false); }
  };
  const handleSvcDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    setDeletingSvcId(id);
    try {
      await authApi(token).delete(`/api/services/${id}`);
      setSvcItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) { alert(err.response?.data?.message || "Delete failed."); }
    finally { setDeletingSvcId(null); }
  };

  // ─── Certificates handlers ────────────────────────────────────────────────
  const handleCertChange = (e) => {
    const { name, value } = e.target;
    setCertForm((f) => ({ ...f, [name]: value }));
  };
  const handleCertSubmit = async (e) => {
    e.preventDefault(); setCertMsg(null); setCertSubmitting(true);
    try {
      const res = await authApi(token).post("/api/certificates", {
        ...certForm, order: Number(certForm.order) || 0,
      });
      setCertItems((prev) => [...prev, res.data.data]);
      setCertForm({ title: "", issuer: "", date: "", credentialUrl: "", order: 0 });
      setCertMsg({ type: "success", text: "Certificate added!" });
    } catch (err) { setCertMsg({ type: "error", text: err.response?.data?.message || "Failed." }); }
    finally { setCertSubmitting(false); }
  };
  const handleCertDelete = async (id) => {
    if (!window.confirm("Delete this certificate?")) return;
    setDeletingCertId(id);
    try {
      await authApi(token).delete(`/api/certificates/${id}`);
      setCertItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) { alert(err.response?.data?.message || "Delete failed."); }
    finally { setDeletingCertId(null); }
  };

  const handleCertImgUpload = async (certId, file) => {
    if (!file) return;
    setCertImgUploading(certId);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await authApi(token).post(`/api/certificates/${certId}/image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCertItems((prev) =>
        prev.map((c) => (c._id === certId ? { ...c, image: res.data.image } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Image upload failed.");
    } finally {
      setCertImgUploading(null);
    }
  };

  // ─── Testimonials handlers ────────────────────────────────────────────────
  const handleTestChange = (e) => {
    const { name, value } = e.target;
    setTestForm((f) => ({ ...f, [name]: value }));
  };
  const handleTestSubmit = async (e) => {
    e.preventDefault(); setTestMsg(null); setTestSubmitting(true);
    try {
      const res = await authApi(token).post("/api/testimonials", {
        ...testForm, rating: Number(testForm.rating) || 5, order: Number(testForm.order) || 0,
      });
      setTestItems((prev) => [...prev, res.data.data]);
      setTestForm({ name: "", role: "", message: "", rating: 5, order: 0 });
      setTestMsg({ type: "success", text: "Testimonial added!" });
    } catch (err) { setTestMsg({ type: "error", text: err.response?.data?.message || "Failed." }); }
    finally { setTestSubmitting(false); }
  };
  const handleTestDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    setDeletingTestId(id);
    try {
      await authApi(token).delete(`/api/testimonials/${id}`);
      setTestItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) { alert(err.response?.data?.message || "Delete failed."); }
    finally { setDeletingTestId(null); }
  };

  // ─── Blog posts handlers ──────────────────────────────────────────────────
  const handlePostChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPostForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault(); setPostMsg(null); setPostSubmitting(true);
    try {
      const res = await authApi(token).post("/api/posts", {
        ...postForm,
        tags: postForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setPostItems((prev) => [res.data.data, ...prev]);
      setPostForm({ title: "", slug: "", excerpt: "", content: "", tags: "", published: false });
      setPostMsg({ type: "success", text: "Post created!" });
    } catch (err) {
      setPostMsg({ type: "error", text: err.response?.data?.message || "Failed to create post." });
    } finally { setPostSubmitting(false); }
  };

  const handlePostDelete = async (id) => {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeletingPostId(id);
    try {
      await authApi(token).delete(`/api/posts/${id}`);
      setPostItems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) { alert(err.response?.data?.message || "Delete failed."); }
    finally { setDeletingPostId(null); }
  };

  const handleTogglePublish = async (post) => {
    try {
      const res = await authApi(token).put(`/api/posts/${post._id}`, { published: !post.published });
      setPostItems((prev) => prev.map((p) => (p._id === post._id ? res.data.data : p)));
    } catch { /* ignore */ }
  };

  const startEditPost = (post) => {
    setEditingPost(post._id);
    setEditPostForm({
      title:     post.title     || "",
      slug:      post.slug      || "",
      excerpt:   post.excerpt   || "",
      content:   post.content   || "",
      tags:      (post.tags     || []).join(", "),
      published: post.published || false,
    });
  };

  const handleEditPostChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditPostForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const saveEditPost = async (id) => {
    setEditPostSaving(true);
    try {
      const res = await authApi(token).put(`/api/posts/${id}`, {
        ...editPostForm,
        tags: editPostForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setPostItems((prev) => prev.map((p) => (p._id === id ? res.data.data : p)));
      setEditingPost(null);
    } catch (err) { alert(err.response?.data?.message || "Update failed."); }
    finally { setEditPostSaving(false); }
  };

  const handleThumbUpload = async (postId, file) => {
    if (!file) return;
    setThumbUploading(postId);
    const fd = new FormData();
    fd.append("cover", file);
    try {
      const res = await authApi(token).post(`/api/posts/${postId}/cover`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPostItems((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, coverImage: res.data.coverImage } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Thumbnail upload failed.");
    } finally {
      setThumbUploading(null);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────
  const unreadCount = messages.filter((m) => !m.read).length;
  const API_BASE    = import.meta.env.VITE_API_URL || "";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="admin-page dashboard">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          Admin<span>.</span>
          <small>Portfolio</small>
        </div>
        <nav className="sidebar-nav">
          {[
            { id: "projects",     icon: <FaLayerGroup />, label: "Projects",     count: projects.length,  countClass: "" },
            { id: "messages",     icon: <FaEnvelope />,   label: "Messages",     count: messages.length, unread: unreadCount, countClass: unreadCount ? "badge-alert" : "" },
            { id: "experience",   icon: <FaBriefcase />,  label: "Experience",   count: expItems.length,  countClass: "" },
            { id: "services",     icon: <FaTools />,      label: "Services",     count: svcItems.length,  countClass: "" },
            { id: "certificates", icon: <FaCertificate />,label: "Certificates", count: certItems.length, countClass: "" },
            { id: "testimonials", icon: <FaQuoteRight />, label: "Testimonials", count: testItems.length, countClass: "" },
            { id: "blog",        icon: <FaNewspaper />,  label: "Blog",         count: postItems.length, countClass: "" },
            { id: "profile",      icon: <FaUser />,       label: "Profile",      count: null },
            { id: "password",     icon: <FaLock />,       label: "Password",     count: null },
          ].map(({ id, icon, label, count, unread, countClass }) => (
            <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>
              {icon} {label}
              {count !== null && (
                <span className={`badge ${countClass}`}>
                  {unread != null && unread > 0 ? `${unread} new` : count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">

        {/* ═══════════════ PROJECTS ═══════════════ */}
        {activeTab === "projects" && (
          <>
            <div className="dash-header">
              <h1>Projects</h1>
              <span className="dash-count">{projects.length} total</span>
            </div>

            <section className="dash-card">
              <h2 className="dash-card-title"><FaPlus /> Add New Project</h2>
              <form onSubmit={handleAddSubmit} className="project-form" noValidate>
                <div className="form-row">
                  <Field label="Title" hint="required">
                    <input name="title" value={addForm.title} onChange={handleAddChange}
                      placeholder="My Awesome Project" required className="admin-input" />
                  </Field>
                  <Field label="Display Order">
                    <input name="order" type="number" value={addForm.order}
                      onChange={handleAddChange} placeholder="0" className="admin-input" />
                  </Field>
                </div>
                <Field label="Description" hint="required">
                  <textarea name="description" value={addForm.description}
                    onChange={handleAddChange} rows={3} required className="admin-input"
                    placeholder="What does this project do?" />
                </Field>
                <Field label="Tech Stack" hint="comma-separated">
                  <input name="techStack" value={addForm.techStack} onChange={handleAddChange}
                    placeholder="React, Node.js, MongoDB" className="admin-input" />
                </Field>
                <div className="form-row">
                  <Field label="GitHub URL">
                    <input name="github" value={addForm.github} onChange={handleAddChange}
                      placeholder="https://github.com/..." className="admin-input" />
                  </Field>
                  <Field label="Live URL">
                    <input name="live" value={addForm.live} onChange={handleAddChange}
                      placeholder="https://..." className="admin-input" />
                  </Field>
                </div>
                <label className="checkbox-label">
                  <input type="checkbox" name="featured" checked={addForm.featured} onChange={handleAddChange} />
                  Mark as Featured
                </label>
                {addError   && <p className="admin-error">{addError}</p>}
                {addSuccess && <p className="admin-success">{addSuccess}</p>}
                <button className="btn-primary" type="submit" disabled={submitting}>
                  {submitting ? <span className="spinner" /> : <><FaPlus /> Add Project</>}
                </button>
              </form>
            </section>

            <section className="dash-card">
              <div className="dash-card-header">
                <h2 className="dash-card-title"><FaCode /> Existing Projects</h2>
                <div className="seed-controls">
                  {seedMsg && <span className={`seed-msg ${seedMsg.type}`}>{seedMsg.text}</span>}
                  <button className="btn-outline seed-btn" onClick={() => handleSeed(false)} disabled={seedLoading}>
                    {seedLoading ? <span className="spinner sm" /> : <><FaDatabase /> Seed</>}
                  </button>
                  <button className="btn-outline seed-btn danger" onClick={() => handleSeed(true)} disabled={seedLoading}>
                    Force Reseed
                  </button>
                </div>
              </div>

              {loadingProjects ? (
                <div className="dash-skeleton">{[...Array(3)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
              ) : projects.length === 0 ? (
                <p className="dash-empty">No projects yet.</p>
              ) : (
                <ul className="project-list">
                  {projects.map((p) => (
                    <li key={p._id} className="project-row">
                      {editId === p._id ? (
                        <div className="edit-form">
                          <div className="form-row">
                            <Field label="Title"><input name="title" value={editForm.title} onChange={handleEditChange} className="admin-input" /></Field>
                            <Field label="Order"><input name="order" type="number" value={editForm.order} onChange={handleEditChange} className="admin-input" /></Field>
                          </div>
                          <Field label="Description"><textarea name="description" value={editForm.description} onChange={handleEditChange} rows={2} className="admin-input" /></Field>
                          <Field label="Tech Stack" hint="comma-separated"><input name="techStack" value={editForm.techStack} onChange={handleEditChange} className="admin-input" /></Field>
                          <div className="form-row">
                            <Field label="GitHub"><input name="github" value={editForm.github} onChange={handleEditChange} className="admin-input" /></Field>
                            <Field label="Live"><input name="live" value={editForm.live} onChange={handleEditChange} className="admin-input" /></Field>
                          </div>
                          <label className="checkbox-label">
                            <input type="checkbox" name="featured" checked={editForm.featured} onChange={handleEditChange} /> Featured
                          </label>
                          <div className="edit-actions">
                            <button className="btn-primary" onClick={() => saveEdit(p._id)} disabled={editSaving}>
                              {editSaving ? <span className="spinner sm" /> : <><FaCheck /> Save</>}
                            </button>
                            <button className="btn-outline" onClick={() => setEditId(null)}><FaTimes /> Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="project-row-info">
                            <span className="project-row-title">{p.featured && <FaStar className="star-inline" />}{p.title}</span>
                            <div className="project-row-chips">{p.techStack?.slice(0, 4).map((t) => <span key={t} className="tech-chip">{t}</span>)}</div>
                          </div>
                          <div className="project-row-actions">
                            <button className="icon-btn star" onClick={() => handleToggleFeatured(p)}>{p.featured ? <FaStar /> : <FaRegStar />}</button>
                            <button className="icon-btn" onClick={() => startEdit(p)}><FaPencilAlt /></button>
                            {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="icon-btn"><FaGithub /></a>}
                            {p.live   && <a href={p.live}   target="_blank" rel="noopener noreferrer" className="icon-btn"><FaExternalLinkAlt /></a>}
                            <button className="icon-btn delete" onClick={() => handleDelete(p._id, p.title)} disabled={deletingId === p._id}>
                              {deletingId === p._id ? <span className="spinner sm" /> : <FaTrash />}
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* ═══════════════ MESSAGES ═══════════════ */}
        {activeTab === "messages" && (
          <>
            <div className="dash-header">
              <h1>Contact Messages</h1>
              <span className="dash-count">
                {messages.length} total &nbsp;·&nbsp; {unreadCount} unread
              </span>
            </div>
            <section className="dash-card">
              {loadingMessages ? (
                <div className="dash-skeleton">{[...Array(3)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
              ) : messages.length === 0 ? (
                <p className="dash-empty">No messages yet.</p>
              ) : (
                <ul className="message-list">
                  {messages.map((m) => (
                    <li key={m._id} className={`message-row ${m.read ? "read" : "unread"}`}>
                      <div className="message-meta">
                        <strong>{m.name}</strong>
                        <a href={`mailto:${m.email}`} className="message-email">{m.email}</a>
                        <span className="message-date">
                          {new Date(m.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                        <span className={`read-badge ${m.read ? "is-read" : "is-unread"}`}>{m.read ? "Read" : "New"}</span>
                        <div className="message-actions">
                          <button className={`icon-btn${m.read ? "" : " star"}`} title={m.read ? "Mark unread" : "Mark read"}
                            onClick={() => handleToggleRead(m)} disabled={togglingMsgId === m._id}>
                            {togglingMsgId === m._id ? <span className="spinner sm" /> : m.read ? <FaRegCircle /> : <FaCheckCircle />}
                          </button>
                          <button className="icon-btn delete" title="Delete" onClick={() => handleDeleteMsg(m._id)} disabled={deletingMsgId === m._id}>
                            {deletingMsgId === m._id ? <span className="spinner sm" /> : <FaTrash />}
                          </button>
                        </div>
                      </div>
                      <p className="message-subject">{m.subject}</p>
                      <p className="message-body">{m.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* ═══════════════ PROFILE ═══════════════ */}
        {activeTab === "profile" && (
          <>
            <div className="dash-header">
              <h1>Profile</h1>
              <span className="dash-count">Your public info</span>
            </div>

            {/* Photo */}
            <section className="dash-card">
              <h2 className="dash-card-title"><FaCamera /> Profile Photo</h2>
              <div className="photo-upload-area">
                <div className="photo-preview-wrap">
                  {photoPreview ? (
                    <img
                      src={photoPreview.startsWith("/uploads") ? `${API_BASE}${photoPreview}` : photoPreview}
                      alt="Profile" className="photo-preview"
                    />
                  ) : (
                    <div className="photo-placeholder"><FaUser /></div>
                  )}
                  {photoUploading && <div className="photo-overlay"><span className="spinner" /></div>}
                </div>
                <div className="photo-upload-info">
                  <p>JPG, PNG or WEBP, max 5 MB.</p>
                  <button className="btn-outline" onClick={() => photoRef.current?.click()} disabled={photoUploading}>
                    <FaCamera /> {photoUploading ? "Uploading…" : "Choose Photo"}
                  </button>
                  <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }} onChange={handlePhotoChange} />
                </div>
              </div>
            </section>

            {/* CV */}
            <section className="dash-card">
              <h2 className="dash-card-title"><FaFilePdf /> CV / Resume</h2>
              <div className="photo-upload-area">
                <div className="cv-icon-wrap">
                  <FaFilePdf />
                </div>
                <div className="photo-upload-info">
                  {cvName
                    ? <p>Current: <strong>{cvName}</strong></p>
                    : <p>No CV uploaded yet. Upload a PDF for the Download CV button.</p>
                  }
                  <button className="btn-outline" onClick={() => cvRef.current?.click()} disabled={cvUploading}>
                    <FaFilePdf /> {cvUploading ? "Uploading…" : cvName ? "Replace CV" : "Upload CV"}
                  </button>
                  <input ref={cvRef} type="file" accept="application/pdf"
                    style={{ display: "none" }} onChange={handleCvChange} />
                </div>
              </div>
            </section>

            {/* Profile form */}
            <section className="dash-card">
              <h2 className="dash-card-title"><FaUser /> Edit Profile</h2>
              {loadingProfile ? (
                <div className="dash-skeleton">{[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="project-form" noValidate>

                  <div className="form-row">
                    <Field label="Full Name" hint="required">
                      <input name="name" value={profileForm.name} onChange={handleProfileChange}
                        className="admin-input" placeholder="Mekuanint Misganaw" required />
                    </Field>
                    <Field label="Professional Title" hint="required">
                      <input name="title" value={profileForm.title} onChange={handleProfileChange}
                        className="admin-input" placeholder="Full Stack Developer" required />
                    </Field>
                  </div>

                  <Field label="Bio" hint="required">
                    <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange}
                      rows={4} className="admin-input" placeholder="Tell visitors about yourself..." required />
                  </Field>

                  <div className="form-row">
                    <Field label="Email" hint="required">
                      <input name="email" type="email" value={profileForm.email}
                        onChange={handleProfileChange} className="admin-input" required />
                    </Field>
                    <Field label="Phone">
                      <input name="phone" value={profileForm.phone}
                        onChange={handleProfileChange} className="admin-input" placeholder="+251 ..." />
                    </Field>
                  </div>

                  <Field label="Location">
                    <input name="location" value={profileForm.location}
                      onChange={handleProfileChange} className="admin-input" placeholder="Bahir Dar, Ethiopia" />
                  </Field>

                  <div className="section-divider">Social Links</div>

                  <div className="form-row">
                    <Field label="GitHub"><input name="github" value={profileForm.github} onChange={handleProfileChange} className="admin-input" placeholder="https://github.com/..." /></Field>
                    <Field label="LinkedIn"><input name="linkedin" value={profileForm.linkedin} onChange={handleProfileChange} className="admin-input" placeholder="https://linkedin.com/in/..." /></Field>
                  </div>
                  <div className="form-row">
                    <Field label="Telegram"><input name="telegram" value={profileForm.telegram} onChange={handleProfileChange} className="admin-input" placeholder="https://t.me/..." /></Field>
                    <Field label="Instagram"><input name="instagram" value={profileForm.instagram} onChange={handleProfileChange} className="admin-input" placeholder="https://instagram.com/..." /></Field>
                  </div>

                  <div className="section-divider">
                    Extra Social Links
                    <button type="button" className="add-social-btn" onClick={addSocial}><FaPlus /> Add</button>
                  </div>
                  {profileForm.extraSocials.length === 0 && (
                    <p className="dash-empty" style={{ padding: "10px 0" }}>No extra links. Click Add to include Twitter, YouTube, etc.</p>
                  )}
                  {profileForm.extraSocials.map((social, idx) => (
                    <div key={idx} className="social-extra-row">
                      <div className="form-group" style={{ flex: "0 0 200px" }}>
                        <label>Platform</label>
                        <PlatformPicker value={social.platform} onChange={(key) => updateSocial(idx, "platform", key)} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>
                          URL
                          {social.platform && (
                            <span className="social-icon-preview" style={{ color: getPlatformMeta(social.platform).color }}>
                              {getPlatformMeta(social.platform).icon}
                            </span>
                          )}
                        </label>
                        <input value={social.url} onChange={(e) => updateSocial(idx, "url", e.target.value)}
                          className="admin-input" placeholder="https://..." />
                      </div>
                      <button type="button" className="icon-btn delete remove-social-btn" onClick={() => removeSocial(idx)}><FaTimes /></button>
                    </div>
                  ))}

                  {/* ── Skills with levels ── */}
                  <div className="section-divider">
                    Skills &amp; Proficiency
                    <button type="button" className="add-social-btn" onClick={addSkill}><FaPlus /> Add Skill</button>
                  </div>
                  {profileForm.skills.length === 0 && (
                    <p className="dash-empty" style={{ padding: "10px 0" }}>No skills yet. Click Add Skill.</p>
                  )}
                  <div className="skills-admin-grid">
                    {profileForm.skills.map((skill, idx) => (
                      <div key={idx} className="skill-admin-row">
                        <input
                          value={skill.name}
                          onChange={(e) => updateSkill(idx, "name", e.target.value)}
                          className="admin-input skill-name-input"
                          placeholder="React"
                        />
                        <div className="skill-level-wrap">
                          <input
                            type="range"
                            min={0} max={100}
                            value={skill.level}
                            onChange={(e) => updateSkill(idx, "level", e.target.value)}
                            className="skill-range"
                          />
                          <span className="skill-level-num">{skill.level}%</span>
                        </div>
                        <button type="button" className="icon-btn delete" onClick={() => removeSkill(idx)}><FaTimes /></button>
                      </div>
                    ))}
                  </div>

                  {/* ── Hero typewriter titles ── */}
                  <div className="section-divider"><FaKeyboard /> Hero Typewriter Titles</div>
                  <Field label="One title per line">
                    <textarea
                      name="heroTitles"
                      value={profileForm.heroTitles}
                      onChange={handleProfileChange}
                      rows={4}
                      className="admin-input"
                      placeholder={"Full Stack Developer\nReact Developer\nNode.js Developer"}
                    />
                  </Field>

                  <div className="section-divider">Stats</div>
                  <div className="form-row three-col">
                    <Field label="Years Experience">
                      <input name="statsYears" type="number" value={profileForm.statsYears}
                        onChange={handleProfileChange} className="admin-input" min={0} />
                    </Field>
                    <Field label="Projects Completed">
                      <input name="statsProjects" type="number" value={profileForm.statsProjects}
                        onChange={handleProfileChange} className="admin-input" min={0} />
                    </Field>
                    <Field label="Skills Count">
                      <input name="statsSkills" type="number" value={profileForm.statsSkills}
                        onChange={handleProfileChange} className="admin-input" min={0} />
                    </Field>
                  </div>

                  {profileMsg && (
                    <p className={profileMsg.type === "success" ? "admin-success" : "admin-error"}>
                      {profileMsg.text}
                    </p>
                  )}
                  <button className="btn-primary" type="submit" disabled={profileSaving}>
                    {profileSaving ? <span className="spinner" /> : <><FaCheck /> Save Profile</>}
                  </button>
                </form>
              )}
            </section>
          </>
        )}

        {/* ═══════════════ PASSWORD ═══════════════ */}
        {activeTab === "password" && (
          <>
            <div className="dash-header">
              <h1>Change Password</h1>
              <span className="dash-count">Admin account</span>
            </div>
            <section className="dash-card" style={{ maxWidth: 480 }}>
              <h2 className="dash-card-title"><FaLock /> Update Password</h2>
              <form onSubmit={handlePwSubmit} className="project-form" noValidate>
                {[
                  { name: "currentPassword", label: "Current Password", key: "current" },
                  { name: "newPassword",     label: "New Password",     key: "new"     },
                  { name: "confirmPassword", label: "Confirm Password", key: "confirm" },
                ].map(({ name, label, key }) => (
                  <Field key={name} label={label}>
                    <div className="input-wrap">
                      <input name={name} type={showPw[key] ? "text" : "password"}
                        value={pwForm[name]} onChange={handlePwChange}
                        className="admin-input" placeholder="••••••••" required minLength={6} />
                      <button type="button" className="pw-toggle"
                        onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}>
                        {showPw[key] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </Field>
                ))}
                {pwMsg && <p className={pwMsg.type === "success" ? "admin-success" : "admin-error"}>{pwMsg.text}</p>}
                <button className="btn-primary" type="submit" disabled={pwSaving}>
                  {pwSaving ? <span className="spinner" /> : <><FaCheck /> Update Password</>}
                </button>
              </form>
            </section>
          </>
        )}

        {/* ═══════════════ EXPERIENCE ═══════════════ */}
        {activeTab === "experience" && (
          <>
            <div className="dash-header">
              <h1>Experience</h1>
              <span className="dash-count">{expItems.length} entries</span>
            </div>

            <section className="dash-card">
              <h2 className="dash-card-title"><FaPlus /> Add Entry</h2>
              <form onSubmit={handleExpSubmit} className="project-form" noValidate>
                <div className="form-row">
                  <Field label="Type">
                    <select name="type" value={expForm.type} onChange={handleExpChange} className="admin-input">
                      <option value="work">Work</option>
                      <option value="education">Education</option>
                    </select>
                  </Field>
                  <Field label="Display Order">
                    <input name="order" type="number" value={expForm.order} onChange={handleExpChange} className="admin-input" />
                  </Field>
                </div>
                <div className="form-row">
                  <Field label="Title" hint="required">
                    <input name="title" value={expForm.title} onChange={handleExpChange} className="admin-input" placeholder="Full Stack Developer" required />
                  </Field>
                  <Field label="Organization" hint="required">
                    <input name="organization" value={expForm.organization} onChange={handleExpChange} className="admin-input" placeholder="Company / University" required />
                  </Field>
                </div>
                <div className="form-row">
                  <Field label="Start Date">
                    <input name="startDate" value={expForm.startDate} onChange={handleExpChange} className="admin-input" placeholder="Sep 2022" />
                  </Field>
                  <Field label="End Date">
                    <input name="endDate" value={expForm.endDate} onChange={handleExpChange} className="admin-input" placeholder="Present" disabled={expForm.current} />
                  </Field>
                </div>
                <label className="checkbox-label">
                  <input type="checkbox" name="current" checked={expForm.current} onChange={handleExpChange} />
                  Currently working / studying here
                </label>
                <Field label="Location">
                  <input name="location" value={expForm.location} onChange={handleExpChange} className="admin-input" placeholder="Bahir Dar, Ethiopia" />
                </Field>
                <Field label="Description">
                  <textarea name="description" value={expForm.description} onChange={handleExpChange} rows={3} className="admin-input" placeholder="What did you do here?" />
                </Field>
                {expMsg && <p className={expMsg.type === "success" ? "admin-success" : "admin-error"}>{expMsg.text}</p>}
                <button className="btn-primary" type="submit" disabled={expSubmitting}>
                  {expSubmitting ? <span className="spinner" /> : <><FaPlus /> Add Entry</>}
                </button>
              </form>
            </section>

            <section className="dash-card">
              <h2 className="dash-card-title"><FaBriefcase /> Existing Entries</h2>
              {expItems.length === 0 ? (
                <p className="dash-empty">No entries yet. Add one above.</p>
              ) : (
                <ul className="project-list">
                  {expItems.map((item) => (
                    <li key={item._id} className="project-row">
                      <div className="project-row-info">
                        <span className="project-row-title">
                          {item.type === "education" ? "🎓" : "💼"} {item.title}
                        </span>
                        <div className="project-row-chips">
                          <span className="tech-chip">{item.organization}</span>
                          <span className="tech-chip">{item.startDate} — {item.current ? "Present" : item.endDate}</span>
                        </div>
                      </div>
                      <div className="project-row-actions">
                        <button className="icon-btn delete" onClick={() => handleExpDelete(item._id)} disabled={deletingExpId === item._id}>
                          {deletingExpId === item._id ? <span className="spinner sm" /> : <FaTrash />}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* ═══════════════ SERVICES ═══════════════ */}
        {activeTab === "services" && (
          <>
            <div className="dash-header">
              <h1>Services</h1>
              <span className="dash-count">{svcItems.length} services</span>
            </div>

            <section className="dash-card">
              <h2 className="dash-card-title"><FaPlus /> Add Service</h2>
              <form onSubmit={handleSvcSubmit} className="project-form" noValidate>
                <div className="form-row">
                  <Field label="Title" hint="required">
                    <input name="title" value={svcForm.title} onChange={handleSvcChange} className="admin-input" placeholder="Web Development" required />
                  </Field>
                  <Field label="Icon">
                    <select name="icon" value={svcForm.icon} onChange={handleSvcChange} className="admin-input">
                      <option value="FaCode">FaCode — Code</option>
                      <option value="FaServer">FaServer — Server</option>
                      <option value="FaDatabase">FaDatabase — Database</option>
                      <option value="FaPaintBrush">FaPaintBrush — Design</option>
                      <option value="FaMobileAlt">FaMobileAlt — Mobile</option>
                      <option value="FaShoppingCart">FaShoppingCart — eCommerce</option>
                    </select>
                  </Field>
                </div>
                <Field label="Description" hint="required">
                  <textarea name="description" value={svcForm.description} onChange={handleSvcChange} rows={2} className="admin-input" placeholder="What does this service include?" required />
                </Field>
                <Field label="Features" hint="one per line">
                  <textarea name="features" value={svcForm.features} onChange={handleSvcChange} rows={4} className="admin-input" placeholder={"Responsive Design\nSEO Optimized\nFast Loading"} />
                </Field>
                <div className="form-row">
                  <Field label="Price">
                    <input name="price" value={svcForm.price} onChange={handleSvcChange} className="admin-input" placeholder="From $50 or Contact for quote" />
                  </Field>
                  <Field label="Order">
                    <input name="order" type="number" value={svcForm.order} onChange={handleSvcChange} className="admin-input" />
                  </Field>
                </div>
                {svcMsg && <p className={svcMsg.type === "success" ? "admin-success" : "admin-error"}>{svcMsg.text}</p>}
                <button className="btn-primary" type="submit" disabled={svcSubmitting}>
                  {svcSubmitting ? <span className="spinner" /> : <><FaPlus /> Add Service</>}
                </button>
              </form>
            </section>

            <section className="dash-card">
              <h2 className="dash-card-title"><FaTools /> Existing Services</h2>
              {svcItems.length === 0 ? (
                <p className="dash-empty">No services yet. Add one above.</p>
              ) : (
                <ul className="project-list">
                  {svcItems.map((item) => (
                    <li key={item._id} className="project-row">
                      <div className="project-row-info">
                        <span className="project-row-title">{item.title}</span>
                        <div className="project-row-chips">
                          {item.features?.slice(0, 3).map((f) => <span key={f} className="tech-chip">{f}</span>)}
                        </div>
                      </div>
                      <div className="project-row-actions">
                        {item.price && <span className="tech-chip">{item.price}</span>}
                        <button className="icon-btn delete" onClick={() => handleSvcDelete(item._id)} disabled={deletingSvcId === item._id}>
                          {deletingSvcId === item._id ? <span className="spinner sm" /> : <FaTrash />}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* ═══════════════ CERTIFICATES ═══════════════ */}
        {activeTab === "certificates" && (
          <>
            <div className="dash-header">
              <h1>Certificates</h1>
              <span className="dash-count">{certItems.length} total</span>
            </div>

            <section className="dash-card">
              <h2 className="dash-card-title"><FaPlus /> Add Certificate</h2>
              <form onSubmit={handleCertSubmit} className="project-form" noValidate>
                <div className="form-row">
                  <Field label="Title" hint="required">
                    <input name="title" value={certForm.title} onChange={handleCertChange} className="admin-input" placeholder="React — The Complete Guide" required />
                  </Field>
                  <Field label="Issuer" hint="required">
                    <input name="issuer" value={certForm.issuer} onChange={handleCertChange} className="admin-input" placeholder="Udemy / Coursera / freeCodeCamp" required />
                  </Field>
                </div>
                <div className="form-row">
                  <Field label="Date">
                    <input name="date" value={certForm.date} onChange={handleCertChange} className="admin-input" placeholder="Jan 2024" />
                  </Field>
                  <Field label="Order">
                    <input name="order" type="number" value={certForm.order} onChange={handleCertChange} className="admin-input" />
                  </Field>
                </div>
                <Field label="Credential URL">
                  <input name="credentialUrl" value={certForm.credentialUrl} onChange={handleCertChange} className="admin-input" placeholder="https://..." />
                </Field>
                {certMsg && <p className={certMsg.type === "success" ? "admin-success" : "admin-error"}>{certMsg.text}</p>}
                <button className="btn-primary" type="submit" disabled={certSubmitting}>
                  {certSubmitting ? <span className="spinner" /> : <><FaPlus /> Add Certificate</>}
                </button>
              </form>
            </section>

            <section className="dash-card">
              <h2 className="dash-card-title"><FaCertificate /> Existing Certificates</h2>
              {certItems.length === 0 ? (
                <p className="dash-empty">No certificates yet. Add one above.</p>
              ) : (
                <ul className="project-list">
                  {certItems.map((item) => (
                    <li key={item._id} className="project-row">
                      {/* Thumbnail */}
                      <div className="post-thumb-wrap">
                        {item.image ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || ""}${item.image}`}
                            alt="badge"
                            className="post-thumb-img"
                          />
                        ) : (
                          <div className="post-thumb-placeholder">
                            <FaCertificate />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: "none" }}
                          ref={(el) => { certImgRefs.current[item._id] = el; }}
                          onChange={(e) => handleCertImgUpload(item._id, e.target.files?.[0])}
                        />
                        <button
                          type="button"
                          className="post-thumb-upload-btn"
                          title="Upload badge image"
                          disabled={certImgUploading === item._id}
                          onClick={() => certImgRefs.current[item._id]?.click()}
                        >
                          {certImgUploading === item._id
                            ? <span className="spinner sm" />
                            : <FaCamera />}
                        </button>
                      </div>

                      <div className="project-row-info">
                        <span className="project-row-title">{item.title}</span>
                        <div className="project-row-chips">
                          <span className="tech-chip">{item.issuer}</span>
                          {item.date && <span className="tech-chip">{item.date}</span>}
                        </div>
                      </div>

                      <div className="project-row-actions">
                        {item.credentialUrl && (
                          <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="icon-btn">
                            <FaExternalLinkAlt />
                          </a>
                        )}
                        <button className="icon-btn delete" onClick={() => handleCertDelete(item._id)} disabled={deletingCertId === item._id}>
                          {deletingCertId === item._id ? <span className="spinner sm" /> : <FaTrash />}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* ═══════════════ TESTIMONIALS ═══════════════ */}
        {activeTab === "testimonials" && (
          <>
            <div className="dash-header">
              <h1>Testimonials</h1>
              <span className="dash-count">{testItems.length} total</span>
            </div>

            <section className="dash-card">
              <h2 className="dash-card-title"><FaPlus /> Add Testimonial</h2>
              <form onSubmit={handleTestSubmit} className="project-form" noValidate>
                <div className="form-row">
                  <Field label="Name" hint="required">
                    <input name="name" value={testForm.name} onChange={handleTestChange} className="admin-input" placeholder="Dr. Abebe Girma" required />
                  </Field>
                  <Field label="Role">
                    <input name="role" value={testForm.role} onChange={handleTestChange} className="admin-input" placeholder="Professor, BDU" />
                  </Field>
                </div>
                <Field label="Message" hint="required">
                  <textarea name="message" value={testForm.message} onChange={handleTestChange} rows={3} className="admin-input" placeholder="What they said about your work..." required />
                </Field>
                <div className="form-row">
                  <Field label="Rating (1–5)">
                    <select name="rating" value={testForm.rating} onChange={handleTestChange} className="admin-input">
                      {[5,4,3,2,1].map((r) => <option key={r} value={r}>{"⭐".repeat(r)} {r} star{r !== 1 ? "s" : ""}</option>)}
                    </select>
                  </Field>
                  <Field label="Order">
                    <input name="order" type="number" value={testForm.order} onChange={handleTestChange} className="admin-input" />
                  </Field>
                </div>
                {testMsg && <p className={testMsg.type === "success" ? "admin-success" : "admin-error"}>{testMsg.text}</p>}
                <button className="btn-primary" type="submit" disabled={testSubmitting}>
                  {testSubmitting ? <span className="spinner" /> : <><FaPlus /> Add Testimonial</>}
                </button>
              </form>
            </section>

            <section className="dash-card">
              <h2 className="dash-card-title"><FaQuoteRight /> Existing Testimonials</h2>
              {testItems.length === 0 ? (
                <p className="dash-empty">No testimonials yet. Add one above.</p>
              ) : (
                <ul className="project-list">
                  {testItems.map((item) => (
                    <li key={item._id} className="project-row">
                      <div className="project-row-info">
                        <span className="project-row-title">{item.name}</span>
                        <div className="project-row-chips">
                          {item.role && <span className="tech-chip">{item.role}</span>}
                          <span className="tech-chip">{"⭐".repeat(item.rating)}</span>
                        </div>
                      </div>
                      <div className="project-row-actions">
                        <button className="icon-btn delete" onClick={() => handleTestDelete(item._id)} disabled={deletingTestId === item._id}>
                          {deletingTestId === item._id ? <span className="spinner sm" /> : <FaTrash />}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* ═══════════════ BLOG ═══════════════ */}
        {activeTab === "blog" && (
          <>
            <div className="dash-header">
              <h1>Blog Posts</h1>
              <span className="dash-count">
                {postItems.length} total &nbsp;·&nbsp;
                {postItems.filter((p) => p.published).length} published
              </span>
            </div>

            {/* Create post form */}
            <section className="dash-card">
              <h2 className="dash-card-title"><FaPlus /> New Post</h2>
              <form onSubmit={handlePostSubmit} className="project-form" noValidate>
                <div className="form-row">
                  <Field label="Title" hint="required">
                    <input name="title" value={postForm.title} onChange={handlePostChange}
                      className="admin-input" placeholder="My First Blog Post" required />
                  </Field>
                  <Field label="Slug" hint="auto-generated if blank">
                    <input name="slug" value={postForm.slug} onChange={handlePostChange}
                      className="admin-input" placeholder="my-first-blog-post" />
                  </Field>
                </div>

                <Field label="Excerpt" hint="required — shown in the blog list (max 300 chars)">
                  <textarea name="excerpt" value={postForm.excerpt} onChange={handlePostChange}
                    rows={2} className="admin-input" required
                    placeholder="A short summary of the article…" maxLength={300} />
                </Field>

                <Field label="Content" hint="required — supports # headings, **bold**, - lists, `code`">
                  <textarea name="content" value={postForm.content} onChange={handlePostChange}
                    rows={12} className="admin-input" required
                    placeholder={"# Introduction\n\nWrite your article here...\n\n## Section 1\n\nContent goes here."} />
                </Field>

                <Field label="Tags" hint="comma-separated">
                  <input name="tags" value={postForm.tags} onChange={handlePostChange}
                    className="admin-input" placeholder="React, Node.js, Tips" />
                </Field>

                <label className="checkbox-label">
                  <input type="checkbox" name="published" checked={postForm.published} onChange={handlePostChange} />
                  Publish immediately (unchecked = draft)
                </label>

                {postMsg && (
                  <p className={postMsg.type === "success" ? "admin-success" : "admin-error"}>
                    {postMsg.text}
                  </p>
                )}

                <button className="btn-primary" type="submit" disabled={postSubmitting}>
                  {postSubmitting ? <span className="spinner" /> : <><FaPlus /> Create Post</>}
                </button>
              </form>
            </section>

            {/* Post list */}
            <section className="dash-card">
              <h2 className="dash-card-title"><FaNewspaper /> All Posts</h2>

              {postItems.length === 0 ? (
                <p className="dash-empty">No posts yet. Create one above.</p>
              ) : (
                <ul className="project-list">
                  {postItems.map((post) => (
                    <li key={post._id} className="project-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 0 }}>
                      {editingPost === post._id ? (
                        /* ── Inline edit ── */
                        <div className="edit-form">
                          <div className="form-row">
                            <Field label="Title">
                              <input name="title" value={editPostForm.title} onChange={handleEditPostChange} className="admin-input" />
                            </Field>
                            <Field label="Slug">
                              <input name="slug" value={editPostForm.slug} onChange={handleEditPostChange} className="admin-input" />
                            </Field>
                          </div>
                          <Field label="Excerpt">
                            <textarea name="excerpt" value={editPostForm.excerpt} onChange={handleEditPostChange} rows={2} className="admin-input" maxLength={300} />
                          </Field>
                          <Field label="Content">
                            <textarea name="content" value={editPostForm.content} onChange={handleEditPostChange} rows={10} className="admin-input" />
                          </Field>
                          <Field label="Tags" hint="comma-separated">
                            <input name="tags" value={editPostForm.tags} onChange={handleEditPostChange} className="admin-input" />
                          </Field>
                          <label className="checkbox-label">
                            <input type="checkbox" name="published" checked={editPostForm.published} onChange={handleEditPostChange} />
                            Published
                          </label>
                          <div className="edit-actions">
                            <button className="btn-primary" onClick={() => saveEditPost(post._id)} disabled={editPostSaving}>
                              {editPostSaving ? <span className="spinner sm" /> : <><FaCheck /> Save</>}
                            </button>
                            <button className="btn-outline" onClick={() => setEditingPost(null)}>
                              <FaTimes /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── Normal row ── */
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {/* Thumbnail preview */}
                          <div className="post-thumb-wrap">
                            {post.coverImage ? (
                              <img
                                src={`${import.meta.env.VITE_API_URL || ""}${post.coverImage}`}
                                alt="thumb"
                                className="post-thumb-img"
                              />
                            ) : (
                              <div className="post-thumb-placeholder">
                                <FaImage />
                              </div>
                            )}
                            {/* Hidden file input per post */}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              style={{ display: "none" }}
                              ref={(el) => { thumbInputRefs.current[post._id] = el; }}
                              onChange={(e) => handleThumbUpload(post._id, e.target.files?.[0])}
                            />
                            {/* Upload overlay button */}
                            <button
                              type="button"
                              className="post-thumb-upload-btn"
                              title="Upload thumbnail"
                              disabled={thumbUploading === post._id}
                              onClick={() => thumbInputRefs.current[post._id]?.click()}
                            >
                              {thumbUploading === post._id
                                ? <span className="spinner sm" />
                                : <FaCamera />}
                            </button>
                          </div>

                          <div className="project-row-info">
                            <span className="project-row-title">
                              {post.title}
                              <span className={`read-badge ${post.published ? "is-read" : "is-unread"}`} style={{ marginLeft: 8 }}>
                                {post.published ? "Published" : "Draft"}
                              </span>
                            </span>
                            <div className="project-row-chips">
                              {post.tags?.slice(0, 3).map((t) => <span key={t} className="tech-chip">{t}</span>)}
                              {post.readTime && <span className="tech-chip">{post.readTime} min</span>}
                              {post.views != null && <span className="tech-chip">{post.views} views</span>}
                            </div>
                          </div>

                          <div className="project-row-actions">
                            <button
                              className={`icon-btn ${post.published ? "star" : ""}`}
                              title={post.published ? "Unpublish" : "Publish"}
                              onClick={() => handleTogglePublish(post)}
                            >
                              {post.published ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button className="icon-btn" title="Edit" onClick={() => startEditPost(post)}>
                              <FaEdit />
                            </button>
                            {post.published && (
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="icon-btn"
                                title="View on site"
                              >
                                <FaGlobe />
                              </a>
                            )}
                            <button
                              className="icon-btn delete"
                              title="Delete"
                              onClick={() => handlePostDelete(post._id)}
                              disabled={deletingPostId === post._id}
                            >
                              {deletingPostId === post._id ? <span className="spinner sm" /> : <FaTrash />}
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

      </main>
    </div>
  );
}
