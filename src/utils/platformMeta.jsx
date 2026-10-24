import {
  FaGithub, FaLinkedin, FaInstagram, FaTelegram,
  FaFacebook, FaTwitter, FaYoutube, FaDribbble,
  FaMedium, FaEnvelope, FaLink, FaSnapchatGhost,
  FaPinterest, FaRedditAlien, FaTwitch, FaDiscord,
  FaWhatsapp, FaSkype, FaStackOverflow, FaCodepen,
  FaBehance, FaPatreon, FaSpotify,
} from "react-icons/fa";
import { SiDevdotto, SiHashnode, SiLeetcode, SiKaggle } from "react-icons/si";

/**
 * All supported social platforms.
 * key  — lowercase identifier stored in DB
 * label — human-readable name shown in dropdown
 * icon  — React icon element
 * color — brand hex color for hover
 */
export const PLATFORMS = [
  { key: "github",        label: "GitHub",          icon: <FaGithub />,         color: "#6e7681" },
  { key: "linkedin",      label: "LinkedIn",         icon: <FaLinkedin />,       color: "#0a66c2" },
  { key: "twitter",       label: "Twitter / X",      icon: <FaTwitter />,        color: "#1da1f2" },
  { key: "instagram",     label: "Instagram",        icon: <FaInstagram />,      color: "#e1306c" },
  { key: "telegram",      label: "Telegram",         icon: <FaTelegram />,       color: "#229ed9" },
  { key: "facebook",      label: "Facebook",         icon: <FaFacebook />,       color: "#1877f2" },
  { key: "youtube",       label: "YouTube",          icon: <FaYoutube />,        color: "#ff0000" },
  { key: "whatsapp",      label: "WhatsApp",         icon: <FaWhatsapp />,       color: "#25d366" },
  { key: "discord",       label: "Discord",          icon: <FaDiscord />,        color: "#5865f2" },
  { key: "twitch",        label: "Twitch",           icon: <FaTwitch />,         color: "#9146ff" },
  { key: "snapchat",      label: "Snapchat",         icon: <FaSnapchatGhost />,  color: "#fffc00" },
  { key: "pinterest",     label: "Pinterest",        icon: <FaPinterest />,      color: "#e60023" },
  { key: "reddit",        label: "Reddit",           icon: <FaRedditAlien />,    color: "#ff4500" },
  { key: "medium",        label: "Medium",           icon: <FaMedium />,         color: "#00ab6c" },
  { key: "dribbble",      label: "Dribbble",         icon: <FaDribbble />,       color: "#ea4c89" },
  { key: "behance",       label: "Behance",          icon: <FaBehance />,        color: "#1769ff" },
  { key: "codepen",       label: "CodePen",          icon: <FaCodepen />,        color: "#ffffff" },
  { key: "stackoverflow", label: "Stack Overflow",   icon: <FaStackOverflow />,  color: "#f48024" },
  { key: "devto",         label: "Dev.to",           icon: <SiDevdotto />,       color: "#0a0a0a" },
  { key: "hashnode",      label: "Hashnode",         icon: <SiHashnode />,       color: "#2962ff" },
  { key: "leetcode",      label: "LeetCode",         icon: <SiLeetcode />,       color: "#ffa116" },
  { key: "kaggle",        label: "Kaggle",           icon: <SiKaggle />,         color: "#20beff" },
  { key: "patreon",       label: "Patreon",          icon: <FaPatreon />,        color: "#f96854" },
  { key: "spotify",       label: "Spotify",          icon: <FaSpotify />,        color: "#1db954" },
  { key: "skype",         label: "Skype",            icon: <FaSkype />,          color: "#00aff0" },
  { key: "email",         label: "Email",            icon: <FaEnvelope />,       color: "#ea4335" },
  { key: "website",       label: "Website / Other",  icon: <FaLink />,           color: "#6366f1" },
];

/** Fast lookup by key */
export const PLATFORM_MAP = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p])
);

/** Returns meta for a platform key (case-insensitive), falls back to website */
export function getPlatformMeta(key) {
  return PLATFORM_MAP[key?.toLowerCase()] ?? PLATFORM_MAP["website"];
}
