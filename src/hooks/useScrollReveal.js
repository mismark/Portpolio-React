import { useEffect, useRef } from "react";

/**
 * Adds the "revealed" class once the element enters the viewport.
 * Elements already visible on mount are revealed immediately.
 */
function useScrollReveal({ threshold = 0.12, delay = "" } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (delay) el.style.transitionDelay = delay;

    const reveal = () => el.classList.add("revealed");

    // Already in view on mount — reveal straight away
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      // rootMargin expands the trigger zone 50px before the element
      // enters the viewport, so fast scrollers never miss it
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay]);

  return ref;
}

export default useScrollReveal;
