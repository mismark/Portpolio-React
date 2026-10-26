/**
 * useSEO — sets document <title> and meta tags dynamically.
 * Call at the top of any page component.
 *
 * useSEO({ title, description, image, url, type })
 */
function setMeta(name, content, isProperty = false) {
  if (!content) return;
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function useSEO({ title, description, image, url, type = "website" } = {}) {
  const siteName  = "Mekuanint Misganaw | Portfolio";
  const fullTitle = title ? `${title} | Mekuanint Misganaw` : siteName;
  const desc      = description || "Full Stack Developer — React, Node.js, MongoDB. Based in Bahir Dar, Ethiopia.";
  const canonical = url || (typeof window !== "undefined" ? window.location.href : "");
  const ogImage   = image || "/favicon.svg";

  // <title>
  document.title = fullTitle;

  // Standard meta
  setMeta("description",        desc);
  setMeta("author",             "Mekuanint Misganaw");
  setMeta("robots",             "index, follow");

  // Open Graph
  setMeta("og:type",            type,       true);
  setMeta("og:title",           fullTitle,  true);
  setMeta("og:description",     desc,       true);
  setMeta("og:image",           ogImage,    true);
  setMeta("og:url",             canonical,  true);
  setMeta("og:site_name",       siteName,   true);

  // Twitter card
  setMeta("twitter:card",       "summary_large_image");
  setMeta("twitter:title",      fullTitle);
  setMeta("twitter:description",desc);
  setMeta("twitter:image",      ogImage);

  // Canonical link
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", canonical);
}

export default useSEO;
