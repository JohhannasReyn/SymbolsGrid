/* ---------------------------------------------------------------
   SIMPLE LINEAR BLEND OF TWO HEX COLORS -> RETURNS HEX
--------------------------------------------------------------- */
export function blend(color1, color2, transitionStep) {
  const ah = parseInt(color1.slice(1), 16)
  const bh = parseInt(color2.slice(1), 16)
  const t = transitionStep
  const r = ((ah >> 16) + ((bh >> 16) - (ah >> 16)) * t) & 0xff
  const g = ((ah >> 8) + ((bh >> 8) - (ah >> 8)) * t) & 0xff
  const b_ = (ah + ((bh - ah) * t)) & 0xff
  return `#${(1 << 24 | r << 16 | g << 8 | b_).toString(16).slice(1)}`
}
/* ─────────────────── Helper: blendRGBA ─────────────────── */
export function blendRGBA(c1, c2, t) {
  const parseRGBA = str => {
    const [r, g, b, a] = str.match(/[\d.]+/g).map(Number)
    return { r, g, b, a: a ?? 1 }
  }
  const a1 = parseRGBA(c1)
  const a2 = parseRGBA(c2)
  const r = Math.round(a1.r + (a2.r - a1.r) * t)
  const g = Math.round(a1.g + (a2.g - a1.g) * t)
  const b = Math.round(a1.b + (a2.b - a1.b) * t)
  const a = +(a1.a + (a2.a - a1.a) * t).toFixed(3)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
/* ─────────────────── Helper: hexToRGBA ─────────────────── */
export function hexToRGBA(hex, alpha = 0.5) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
/* ───────── Global Variables for Clock Management ───────── */
const PERIOD = 8 // seconds for a full up-and-down cycle
const FPS = 30 // state updates / second
let ticker = null
let clockStartTime = null
let currentRootState = null
/* ─────────────── Improved Clock Management ─────────────── */
export function ensureClock(rootState) {
  if (ticker) return;
  console.log('Starting clock for dynamic theme');
  currentRootState = rootState;
  clockStartTime = performance.now();
  ticker = setInterval(() => {
    const now = performance.now();
    const clockTime = (now - clockStartTime) / 1000;
    if (clockTime >= 100) console.clear();
    console.log('Clock tick:', clockTime); // Debug log
    if (currentRootState && typeof currentRootState.update === 'function') {
      try { currentRootState.update({ clock: clockTime }) }
      catch (error) { console.warn('Clock update error:', error) }
    }
  }, 1000 / FPS)
}
/* ─────────────────── Helper: stopClock ─────────────────── */
export function stopClock() {
  if (ticker) {
    console.log('Stopping clock'); clearInterval(ticker);
    ticker = null; clockStartTime = null; currentRootState = null;
  }
}
/* ───────────── Manual Clock Update (fallback) ───────────── */
export function updateClock() {
  if (clockStartTime && currentRootState) {
    const now = performance.now();
    const clockTime = (now - clockStartTime) / 1000;
    currentRootState.update({ clock: clockTime });
    return clockTime;
  }
  return 0;
}
/* ───────────────────── Helper: triWave ──────────────────── */
export function triWave(t) {
  const phase = (t % PERIOD) / PERIOD * 2; // 0‒2
  return phase < 1 ? phase * 100 // up-slope
    : (2 - phase) * 100; // down-slope
}
/* ─────────────────────── Helper: hsl ────────────────────── */
export const hsl = (h, s = 80, l = 50) => `hsl(${h} ${s}% ${l}%)`
/* ──────────────────── Helper: rootOf ───────────────────── */
export const rootOf = st => (st?.root ?? st) // always returns a root
/* ──────────────────── Helper: clock ───────────────────── */
export const clock = st => {
  const clockTime = rootOf(st).state?.clock ?? 0;
  if (clockTime === 0 && clockStartTime) {
    const now = performance.now();
    return (now - clockStartTime) / 1000;
  }
  return clockTime;
}
/* ──────────────────── Helper: ratios ───────────────────── */
export const ratios = st => {
  const state = rootOf(st).state ?? {}
  return { sel: state.selRatio ?? 0, hi: state.hiRatio ?? 0 }
}
/* ──────────────── Dynamic Theme Token Helper ────────────── */
export const token = (value, el, st) => {
  if (typeof value === 'function') {
    try { return value(el, st) }
    catch (error) {
      console.warn('Error applying dynamic theme token:', error);
      return '#000000'; // fallback color
    }
  }
  return value;
}
/* ── Theme Detection Helper ────────────────────────────────── */
export function hasDynamicTheme(theme) {
  return typeof theme.background === 'function' ||
    typeof theme.cardBg === 'function' ||
    typeof theme.cardBorder === 'function' ||
    typeof theme.cardShadow === 'function';
}
/* ── Force Update Helper for Dynamic Themes ────────────────── */
export function forceThemeUpdate() {
  if (currentRootState) updateClock();
}
/* ─────────────────────────────────────────────────────────────────────────── */
/* ───────────────────────────────────────────────────────────────────────────
                                THEMES
────────────────────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────────────── */
/* ─────────────────── LIGHT THEME : STATIC DEFAULT L&F ─────────────────── */
export const light = {
  background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
  cardBg: 'rgb(254, 254, 254)',
  cardBorder: '1px solid rgba(0,0,0,.05)',
  cardShadow: '0 8px 20px rgba(0,0,0,.08)',
  cellBorder: '1px solid rgba(0,0,0,.08)',
  cellPreview: 'rgba(75, 136, 228, 0.75)',
  cellOutline: 'rgba(75, 136, 228, 0.67)',
  cellSelected: 'rgba(8, 35, 110, 0.66)',
  cellDefault: 'rgba(176, 207, 252, 0.65)',
  headerText: 'rgb(0, 0, 0)',
  footerText: 'rgba(50, 50, 50, 1)',
  text: 'rgb(0,0,0)'
}
/* ────────────────────── DARK THEME: STATIC DARK L&F ────────────────────── */
export const dark = {
  background: 'linear-gradient(35deg,#030945 0%,#1f0030 100%)',
  cardBg: 'rgba(45, 45, 46, 0.4)',
  cardBorder: '1px solid rgba(148,163,184,.85)',
  cardShadow: '0 8px 20px rgba(0, 0, 0, 0.32)',
  cellBorder: '1px solid rgba(131, 22, 22, 0.67)',
  cellPreview: 'rgba(95, 13, 13, 0.56)',
  cellOutline: 'rgba(95, 13, 13, 0.56)',
  cellSelected: 'rgb(48, 0, 110)',
  cellDefault: 'rgba(71, 71, 71, 0.1)',
  headerText: '#f8fafc',
  footerText: '#cbd5e1',
  text: 'rgb(247, 247, 247)'
}
/* ──────────────────── NEON THEME: CYCLING COLOR WHEEL ──────────────────── */
const GAP_NEON = 30 // distance between the two gradient stops
const PER_NEON = 6  // full rainbow loop every 6 s
export const neon = {
  /* dynamic background */
  background: (_, st) => {
    const root = rootOf(st)
    ensureClock(root)
    const t = clock(st)
    const hueA = (t / PER_NEON * 360) % 360 // 0‒360
    const hueB = (hueA + 180) % 360 // complement
    let colA = hsl(hueA, 100, 50)
    let colB = hsl(hueB, 100, 50)
    const { hi: hiT } = ratios(st)
    let a = hiT * (100 - GAP_NEON) // 0‒70 (if GAP=30)
    let b = a + GAP_NEON // 30‒100
    /* wrap + colour swap so darker edge always leads */
    if (b > 100) {
      b = b - 100 // wrap second stop
        ;[colA, colB] = [colB, colA] // swap colours for ascending order
        ;[a, b] = [b, a] // keep stops ascending
    }
    return `linear-gradient(170deg, ${colA} ${a.toFixed(2)}%, ${colB} ${b.toFixed(2)}%)`
  },
  cardBg: (_, st) => {
    const t = clock(st); const h1 = hsl((t / 8 * 360) % 360, 90, 25);
    const h2 = hsl((t / 8 * 270) % 360, 90, 25); const h3 = hsl((t / 8 * 180) % 360, 90, 25);
    return `radial-gradient(circle, ${h1} 0%, ${h2} 50%, ${h3} 99%)`;
  },
  cardBorder: '1px solid #1e293b', cardShadow: '0 8px 20px rgba(64, 85, 112, 0.74)',
  cellBorder: '1px solid rgba(110, 255, 52, 0.57)', cellPreview: 'rgba(212, 245, 28, 0.77)',
  cellOutline: 'rgba(255, 35, 218, 0.33)', cellSelected: 'rgba(61, 7, 48, 0.86)',
  cellDefault: 'rgba(67, 204, 238, 0.64)', headerText: 'rgb(255, 255, 255)',
  footerText: '#22d3ee', text: '#67e8f9'
}
/* ───────────────────────── DYNAMIC VIBRANT THEME ───────────────────────── */
const START_VIBE = '#00d165'
const END_VIBE = '#0003d1'
const WARP_DIST = 50
export const vibrant = {
  background: (_, st) => {
    const root = rootOf(st);
    ensureClock(root);// Always ensure clock is running for ocean theme
    let t = clock(st);// Get current clock time with fallback
    // Force update if time is advancing but state isn't
    if (t > 0) { setTimeout(() => forceThemeUpdate(), 50); }
    // If still 0, manually calculate time
    if (!t && clockStartTime) t = (performance.now() - clockStartTime) / 1000
    const a = (t * 10) % 100; const b = (a + WARP_DIST) % 100;
    const [c1, c2] = a < b ? [START_VIBE, END_VIBE] : [END_VIBE, START_VIBE];
    const [s1, s2] = [Math.min(a, b), Math.max(a, b)].map(v => v.toFixed(2));
    return `linear-gradient(45deg, ${c1} ${s1}%, ${c2} ${s2}%)`;
  },
  cardBg: (_, st) => {
    const { sel: selT } = ratios(st);
    const start = `rgba(${(25 * selT) % 255}, 255, 0, 0.58)`;
    const end = `rgba(255, ${(25 * selT) % 255}, 0, 0.65)`;
    const merge1 = `rgba(255, 0, ${(25 * selT) % 255}, 0.65)`;
    const merge2 = `rgba(0, 255, ${(25 * selT) % 255}, 0.63)`;
    return `radial-gradient(circle, ${start} 6%,  ${merge1} 29%, ${merge2} 55%,  ${end} 100%)`;
  },
  cardBorder: '1px solid #fed7aa', cardShadow: '0 8px 20px rgba(217, 119, 6, 0.1)',
  cellBorder: '1px solid #d97706', cellPreview: 'rgba(212, 245, 28, 0.77)',
  cellOutline: 'rgba(255, 35, 218, 0.33)', cellSelected: '#f59e0b',
  cellDefault: 'rgba(254, 243, 199, 0.8)', headerText: 'rgb(62, 109, 0)',
  footerText: '#92400e', text: '#78350f'
}
/* ────────────── OCEAN THEME : WAVES MOVING PAST AN ISLAND ────────────── */
export const ocean = {
  /* Page background rotates gradient angle based on highlights */
  background: (_, st) => {
    const root = rootOf(st); ensureClock(root);// Always ensure clock is running for ocean theme
    let t = clock(st); // Get current clock time with fallback
    if (t === 0 && clockStartTime) { t = (performance.now() - clockStartTime) / 1000 } // If still 0, manually calculate time
    const period = 12; // Loop every 12 seconds
    const waveWidth = 15; // how wide the "wave" appears (in % span)
    const cycle = (t % period) / period;
    const center = -waveWidth + (100 + 2 * waveWidth) * cycle; // animate left to right from [-waveWidth,100+waveWidth]
    if (t > 0) { setTimeout(() => forceThemeUpdate(), 50) }// Force update if time is advancing but state isn't
    const start = center - waveWidth; // Compute edges of the wave, wrapping around if needed
    const end = center + waveWidth;
    const baseDark = `rgba(5, 0, 94, 1.0)`;   // trailing color
    const waveColor = 'rgba(0, 114, 145, 1)';     // the "light wave"
    const tipDark = 'rgba(4, 4, 125, 1)';         // subtle front-end shade
    let gradient; // The gradient to be returned
    if (center < 0) { // Handle cycle ends
      gradient = `linear-gradient(119deg, ${tipDark} 0%, ${baseDark} ${end.toFixed(2)}%, ${baseDark} 100%)`
    } else if (start < 0) {// start case
      gradient = `linear-gradient(119deg, ${waveColor} 0%, , ${tipDark} ${center.toFixed(2)}%, ${baseDark} ${end.toFixed(2)}%, ${baseDark} 100%)`
    } else if (end < 100) {// normal case
      gradient = `linear-gradient(119deg, ${baseDark} 0%, ${tipDark} ${start.toFixed(2)}%, ${waveColor} ${center.toFixed(2)}%, ${tipDark} ${end.toFixed(2)}%, ${baseDark} 100%)`
    } else if (end > 100) {// end case
      gradient = `linear-gradient(119deg, ${baseDark} 0%, ${baseDark} ${start.toFixed(2)}%, ${tipDark} ${center.toFixed(2)}%, ${waveColor} 100%)`
    } else if (center > 100) {// end case
      gradient = `linear-gradient(119deg, ${baseDark} 0%, ${baseDark} ${start.toFixed(2)}%, ${tipDark} 100%)`
    } else {// wrap case (when wave crosses 100% back to 0%)
      gradient = `linear-gradient(119deg, ${baseDark} 0%, ${baseDark} 100%)`
    return gradient.replace(/\s+/g, ' ') // compact for CSS
  },/* Card background gets darker blue the more cells are selected */
  cardBg: (_el, st) => {
    const root = rootOf(st); ensureClock(root); let t = clock(st);
    if (t > 0) { setTimeout(() => forceThemeUpdate(), 50) }// Force update if time is advancing but state isn't
    const selT = (t * 0.1) % 20; // 0 → none, 1 → full grid
    const fade = ((t % 69) / 100.0);
    const base = `rgba(64, 52, 222, ${fade.toFixed(2)})`;
    const pick = `rgba(255, 250, 214, ${(0.70 - fade).toFixed(2)})`; // e.g. '#3b82f6'
    return blendRGBA(base, pick, selT * 0.8); // cap at 80 % tint
  },
  cardBorder: '1px solid rgba(255, 255, 255,.88)', cardShadow: '0px 0px 3px 22px rgba(241, 212, 143, 0.89)',
  cellBorder: '1px solid rgba(165, 160, 160, 0.6)', cellPreview: 'rgba(53, 148, 211, 0.79)',
  cellOutline: 'rgba(141, 192, 250, 0.75)', cellSelected: 'rgba(8, 49, 28, 0.62)',
  cellDefault: 'rgba(129, 229, 118, 0.6)', headerText: 'rgba(2, 88, 9, 0.94)',
  footerText: 'rgba(13, 66, 13, 0.99)', text: 'rgba(14, 85, 7, 0.99)'
}
export default light
