import { useState, useRef, useEffect } from "react";
import { PLATFORMS, getPlatformMeta } from "../../utils/platformMeta";
import { FaChevronDown } from "react-icons/fa";
import "./PlatformPicker.css";

/**
 * Dropdown that shows every platform with its icon.
 * Props:
 *   value    — currently selected platform key (string)
 *   onChange — called with the new key string
 */
function PlatformPicker({ value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref                 = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = search
    ? PLATFORMS.filter((p) =>
        p.label.toLowerCase().includes(search.toLowerCase()) ||
        p.key.toLowerCase().includes(search.toLowerCase())
      )
    : PLATFORMS;

  const selected = value ? getPlatformMeta(value) : null;

  const handleSelect = (key) => {
    onChange(key);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="platform-picker" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        className={`picker-trigger admin-input${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <span className="picker-selected">
            <span className="picker-icon" style={{ color: selected.color }}>
              {selected.icon}
            </span>
            {selected.label}
          </span>
        ) : (
          <span className="picker-placeholder">Select platform…</span>
        )}
        <FaChevronDown className={`picker-caret${open ? " rotated" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="picker-dropdown" role="listbox">
          {/* Search */}
          <div className="picker-search-wrap">
            <input
              type="text"
              className="admin-input picker-search"
              placeholder="Search platforms…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Options */}
          <ul className="picker-list">
            {filtered.length === 0 && (
              <li className="picker-empty">No platforms found</li>
            )}
            {filtered.map((p) => (
              <li
                key={p.key}
                role="option"
                aria-selected={value === p.key}
                className={`picker-option${value === p.key ? " selected" : ""}`}
                onClick={() => handleSelect(p.key)}
              >
                <span className="picker-icon" style={{ color: p.color }}>
                  {p.icon}
                </span>
                <span className="picker-option-label">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PlatformPicker;
