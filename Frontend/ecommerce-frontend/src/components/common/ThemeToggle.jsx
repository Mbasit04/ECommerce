import React from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * ThemeToggle
 * -----------
 * Small button that flips between light and dark themes. Two variants:
 *
 *   - `variant="icon"`   — circular icon-only button (best for navbars)
 *   - `variant="switch"` — labelled switch with both icons (best for settings)
 *
 * The button inherits text colour from the parent so it looks at home in
 * both light and dark shells.
 */
const ThemeToggle = ({ variant = "icon", className = "", label }) => {
  const { isDark, toggleTheme } = useTheme();

  const nextLabel = isDark ? "Switch to light theme" : "Switch to dark theme";

  if (variant === "switch") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={
          "theme-toggle theme-toggle-switch d-inline-flex align-items-center gap-2 " +
          className
        }
        aria-label={nextLabel}
        aria-pressed={isDark}
        title={nextLabel}
      >
        <span className="theme-toggle-track">
          <span
            className={
              "theme-toggle-thumb" + (isDark ? " is-dark" : " is-light")
            }
          >
            <span aria-hidden="true">{isDark ? "🌙" : "☀️"}</span>
          </span>
        </span>
        {label && (
          <span className="theme-toggle-label">
            {label ?? (isDark ? "Dark" : "Light")}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={"theme-toggle theme-toggle-icon " + className}
      aria-label={nextLabel}
      aria-pressed={isDark}
      title={nextLabel}
    >
      <span aria-hidden="true" className="theme-toggle-icon-glyph">
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
};

export default ThemeToggle;