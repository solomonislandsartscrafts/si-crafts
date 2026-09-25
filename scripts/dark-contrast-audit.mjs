/**
 * Dark-theme WCAG contrast audit.
 *
 * Computes the real WCAG 2.1 contrast ratio for every foreground/background
 * pair used by the dark theme (the palette in the `.dp-dark` block of
 * globals.css) and reports pass/fail against the AA thresholds:
 *   - normal text   4.5:1
 *   - large text     3:1  (>= 24px, or >= 18.66px bold)
 *   - UI components  3:1  (borders, focus rings, icons)
 *
 * Pure Node, no browser — this validates the colour maths directly. It does NOT
 * replace a real axe/screen-reader pass in a browser (which also checks focus
 * order, ARIA, etc.), but it is the authoritative check for colour contrast.
 *
 * Run: node scripts/dark-contrast-audit.mjs
 */

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

// Relative luminance per WCAG 2.1.
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// Dark palette (must match the `:is(.dark-preview, .dp-dark)` block in globals.css).
const P = {
  bg: '#0E1E27',
  surface: '#182B35',
  surface2: '#1F3540',
  band: '#13242D',
  border: '#33505E',
  borderStrong: '#63879A',
  heading: '#F5F8F9',
  text: '#E4EAED',
  text2: '#A9BAC4',
  link: '#7FB6F5',
  linkHv: '#A9CEFA',
  greenFill: '#3BBB63',
  greenTx: '#4FC975',
  gold: '#F4B728',
  error: '#FF8A7A',
  ring: '#7FB6F5',
  btnPrimaryText: '#08130C',
  btnDangerText: '#2A0906',
  btnAdmin: '#2B5A76',
  pill: '#22404F',
  white: '#FFFFFF',
};

// [label, foreground, background, threshold, kind]
const checks = [
  // Text on the three surfaces (worst case is the lightest surface).
  ['Heading on canvas', P.heading, P.bg, 4.5, 'text'],
  ['Heading on surface', P.heading, P.surface, 4.5, 'text'],
  ['Heading on band', P.heading, P.band, 4.5, 'text'],
  ['Body on canvas', P.text, P.bg, 4.5, 'text'],
  ['Body on surface', P.text, P.surface, 4.5, 'text'],
  ['Body on band', P.text, P.band, 4.5, 'text'],
  ['Secondary/meta on canvas', P.text2, P.bg, 4.5, 'text'],
  ['Secondary/meta on surface', P.text2, P.surface, 4.5, 'text'],
  ['Secondary/meta on surface-2 (hover)', P.text2, P.surface2, 4.5, 'text'],
  // Links / accents as text.
  ['Link on canvas', P.link, P.bg, 4.5, 'text'],
  ['Link on surface', P.link, P.surface, 4.5, 'text'],
  ['Link hover on surface', P.linkHv, P.surface, 4.5, 'text'],
  ['Green-as-text on surface', P.greenTx, P.surface, 4.5, 'text'],
  // brand-green as text/icon (bullets, active filter) — lifted to greenTx.
  ['Green text/icon on canvas', P.greenTx, P.bg, 4.5, 'text'],
  // Text on a bg-sand-light panel, now remapped to --dp-surface.
  ['Body on sand-light panel (now surface)', P.text, P.surface, 4.5, 'text'],
  ['Heading on sand-light panel (now surface)', P.heading, P.surface, 4.5, 'text'],
  ['Secondary on sand-light panel (now surface)', P.text2, P.surface, 4.5, 'text'],
  // Muted deep-blue text at reduced opacity, remapped to light ink. The
  // catalogue "…to view wholesale pricing" prompt is deep-blue/90 → light/0.92.
  // Approximate the composite over the canvas: light ink at 0.92 alpha.
  ['deep-blue/90 prompt text (light 0.92 over canvas)', '#E3E7E8', P.bg, 4.5, 'text'],
  ['deep-blue/70 muted label (light 0.75 over canvas)', '#BBC2C5', P.bg, 4.5, 'text'],
  ['Gold accent on canvas', P.gold, P.bg, 3.0, 'large'],
  ['Error text on surface', P.error, P.surface, 4.5, 'text'],
  // Buttons: dark label on the coloured fill (the accessible direction).
  ['Primary btn: dark text on green fill', P.btnPrimaryText, P.greenFill, 4.5, 'text'],
  ['Danger btn: dark text on error fill', P.btnDangerText, P.error, 4.5, 'text'],
  ['Admin btn: white text on admin fill', P.white, P.btnAdmin, 4.5, 'text'],
  ['Secondary btn: link text on canvas', P.link, P.bg, 4.5, 'text'],
  // Pill on imagery — white label on the lifted pill.
  ['Pill: white text on pill fill', P.white, P.pill, 4.5, 'text'],
  // Announcement bar / gold surfaces that KEEP their light-theme fill on dark.
  ['Announcement blue: white text on lifted deep-blue', P.white, P.pill, 4.5, 'text'],
  ['Gold fill: dark ink kept (not whitened)', '#1B3A4B', '#F4B728', 4.5, 'text'],
  // Header icon-only controls (theme toggle, search, cart, hamburger). Their
  // icon is lifted from the muted --dp-text-2 to the full body ink --dp-text on
  // dark so a thin 2px glyph reads clearly on the header surface; hover lands on
  // the heading ink. A stroke icon is a non-text UI component (3:1) but these
  // clear the 4.5:1 text bar too, with margin.
  ['Header icon (rest) on header surface', P.text, P.surface, 3.0, 'ui'],
  ['Header icon (hover) on header surface', P.heading, P.surface, 3.0, 'ui'],
  // Non-text UI components (3:1).
  ['Focus ring vs surface', P.ring, P.surface, 3.0, 'ui'],
  ['Focus ring vs canvas', P.ring, P.bg, 3.0, 'ui'],
  ['Strong divider vs surface', P.borderStrong, P.surface, 3.0, 'ui'],
];

let failures = 0;
console.log('\nDark theme — WCAG 2.1 contrast audit\n' + '='.repeat(60));
for (const [label, fg, bg, threshold, kind] of checks) {
  const r = ratio(fg, bg);
  const pass = r >= threshold;
  if (!pass) failures++;
  const mark = pass ? 'PASS' : 'FAIL';
  const grade = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA-large/UI' : '—';
  console.log(
    `${mark}  ${r.toFixed(2).padStart(6)}:1  ${grade.padEnd(12)} ${label}  ` +
      `(${kind}, need ${threshold}:1)`
  );
}
console.log('='.repeat(60));
if (failures) {
  console.log(`\n${failures} pair(s) FAILED the AA threshold.\n`);
  process.exit(1);
}
console.log('\nAll pairs meet their WCAG 2.1 AA threshold.\n');
