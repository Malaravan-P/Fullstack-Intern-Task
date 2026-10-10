export const FONT_OPTIONS = [
  { id: "default", label: "Template default", stack: null },
  {
    id: "inter",
    label: "Inter / System Sans",
    stack:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  },
  { id: "serif", label: "Elegant Serif", stack: "Georgia,'Times New Roman',serif" },
  { id: "mono", label: "Developer Mono", stack: "ui-monospace,'SF Mono',Menlo,Consolas,monospace" },
  { id: "rounded", label: "Rounded", stack: "'Trebuchet MS','Segoe UI',sans-serif" },
];

function hexToRgba(hex, alpha) {
  const clean = String(hex || "").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* Pull the first --accent / --accent2 hex value out of a preview document. */
export function extractTheme(html) {
  const read = (key) => {
    const m = String(html || "").match(new RegExp(`--${key}:\\s*(#[0-9a-fA-F]{3,6})`));
    return m ? m[1] : null;
  };
  return {
    accent: read("accent") || "#4f46e5",
    accent2: read("accent2") || "#8b5cf6",
  };
}

/**
 * Inject a theme override stylesheet into a stored preview document so the
 * playground can re-color / re-font the live iframe without re-saving it.
 */
export function buildCustomHtml(html, { accent, accent2, fontStack }) {
  if (!html) return html;
  const rules = [];
  const vars = [];
  if (accent) vars.push(`--accent:${accent}`);
  if (accent2) vars.push(`--accent2:${accent2}`);
  if (accent) {
    const shadow = hexToRgba(accent, 0.25);
    if (shadow) vars.push(`--accentShadow:${shadow}`);
  }
  if (vars.length) rules.push(`:root{${vars.join(";")}}`);
  if (fontStack) rules.push(`body,body *{font-family:${fontStack} !important}`);

  if (!rules.length) return html;
  const style = `<style id="playground-theme">${rules.join("")}</style>`;
  // Append right before </head> so it wins the cascade over the template CSS.
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${style}</head>`);
  return style + html;
}