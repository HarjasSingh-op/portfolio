/* global React, useTweaks, TweaksPanel, TweakSection, TweakColor, TweakToggle */
// Tweaks overlay for the Harjas Singh portfolio.
// Drives the site's accent CSS variables (and the particle background) so the
// whole theme can be recolored live. Mounts as an overlay — no rewrite of the
// underlying vanilla site.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": ["#34d399", "#2dd4bf"],
  "animatedBg": true
}/*EDITMODE-END*/;

// Curated accent themes: [primary, secondary]
const THEMES = [
  ["#34d399", "#2dd4bf"], // Emerald (default)
  ["#a78bfa", "#22d3ee"], // Violet
  ["#38bdf8", "#818cf8"], // Sky
  ["#fb7185", "#f472b6"], // Rose
  ["#fbbf24", "#fb923c"]  // Amber
];

function hexToRgba(hex, a) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return hex;
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function applyTheme(pair) {
  if (!Array.isArray(pair)) return;
  const a = pair[0], a2 = pair[1] || pair[0];
  const s = document.documentElement.style;
  s.setProperty("--accent", a);
  s.setProperty("--accent-2", a2);
  s.setProperty("--accent-soft", hexToRgba(a, 0.12));
  s.setProperty("--accent-ring", hexToRgba(a, 0.35));
  window.dispatchEvent(new CustomEvent("accentchange"));
}

function applyBg(on) {
  const c = document.getElementById("bgCanvas");
  if (c) c.style.display = on ? "" : "none";
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => { applyTheme(t.theme); }, [t.theme]);
  React.useEffect(() => { applyBg(t.animatedBg); }, [t.animatedBg]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Color theme" />
      <TweakColor
        label="Accent"
        value={t.theme}
        options={THEMES}
        onChange={(v) => setTweak("theme", v)}
      />
      <TweakSection label="Background" />
      <TweakToggle
        label="Animated particles"
        value={t.animatedBg}
        onChange={(v) => setTweak("animatedBg", v)}
      />
    </TweaksPanel>
  );
}

(function mount() {
  const el = document.getElementById("tweaks-root");
  if (el) ReactDOM.createRoot(el).render(<TweaksApp />);
})();
