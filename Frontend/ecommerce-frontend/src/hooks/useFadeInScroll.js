import { useEffect } from "react";

// Adds the `.is-visible` class to any element with `.fade-in` once it
// scrolls into view. Used by the home page so categories / featured
// products / deals fade in instead of popping in.
//
// Returns nothing — the hook just wires the observer on mount and
// cleans it up on unmount.
export default function useFadeInScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const elements = Array.from(
      document.querySelectorAll(".fade-in:not(.is-visible)"),
    );

    if (elements.length === 0) return undefined;

    if (!("IntersectionObserver" in window)) {
      // Fallback for older browsers — just reveal everything.
      elements.forEach((node) => node.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Start the fade slightly before the element is fully on screen so
        // it doesn't feel like it's "snapping in" at the edge.
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1,
      },
    );

    elements.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
    };
  }, []);
}
