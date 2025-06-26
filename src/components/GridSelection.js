import * as themes from '../themes/index.js'
/* ──────────────────────────────────────── FONT ──────────────────────────────────────── */
export const Europa = { props: { style: { fontFamily: `'Europa', Helvetica, sans-serif` } } }
/* ────────────────────────────────────────────────────────────────────────────────────── */
/* ──────────────────────────── shared state ──────────────────────────── */
const registry = {}; const sel = new Set(); let last = ' , '; let colour = {}; let totalCells = 0;
/* ──────────────────────────────────────────────────────────────────────────────────────────── */
/* ───────────────────────────────── helpers ───────────────────────────────── */
const keyOf = (y, x) => `C_${y}_${x}`
function visual(root, y, x) {
  const k = keyOf(y, x)
  if (sel.has(k)) return 'selected'
  const { hoverY, hoverX } = root.state
  if (hoverY != null && hoverX != null && y <= hoverY && x <= hoverX)
    return (hoverY === y || hoverX === x) ? 'outline' : 'preview'
  return 'default'
}
/* ─────────────────────────────────────────────────────────────────────────── */
/* ──────────────────────────── Grid Cell Factory ──────────────────────────── */
function makeCell(y, x, bg) {
  const key = keyOf(y, x)
  return {
    key, tag: 'div', state: { y, x }, extend: [Europa],
    style: (_e, _st, ctx) => ({
      width: '100%', height: '100%', minWidth: '45px', minHeight: '45px', display: 'flex',
      alignItems: 'center', justifyContent: 'center', transition: 'background .12s',
      border: themes.token(colour.cellBorder, _e, ctx.root || ctx),// Use themes.token for dynamic properties
      background: bg[visual(ctx.root || ctx, y, x)], borderRadius: '4px'
    }),
    on: {
      init: (_e, st) => { registry[key] = st },
      mouseenter: (_, _el, st) => {
        st.root.update({ hoverY: y, hoverX: x });
        updateHoverRatio(st.root, y, x)// Update hover ratio for dynamic themes
      },
      mouseleave: (_, _el, st) => {
        st.root.update({ hoverY: null, hoverX: null });
        updateHoverRatio(st.root, null, null);
      },
      click: (_, _el, st) => {
        sel.clear()
        for (let ry = 0; ry <= y; ++ry)
          for (let rx = 0; rx <= x; ++rx)
            sel.add(keyOf(ry, rx))
        last = `${y + 1},${x + 1}`
        updateSelectionRatio(st.root) // Update selection ratio for dynamic themes (Change by selection opposed to time).
        st.root.update()
      }
    }
  }
}
/* ─────────────────────────────────────────────────────────────────────────── */
/* ──────────────────────── ratio calculation helpers ──────────────────────── */
function updateSelectionRatio(rootState) {
  if (rootState && totalCells > 0) {
    rootState.update({ selRatio: sel.size / totalCells })
  }
}

function updateHoverRatio(rootState, hoverY, hoverX) {
  if (rootState && totalCells > 0) {
    if (hoverY !== null && hoverX !== null) {
      const hoveredCells = (hoverY + 1) * (hoverX + 1)
      rootState.update({ hiRatio: hoveredCells / totalCells })
    } else {
      rootState.update({ hiRatio: 0 })
    }
  }
}
/* ─────────────────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────────────── */
/* ─────────────────────────────── Main factory ────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────────────── */
export function createGridSelection(cols = 16, rows = 8, theme = {}) {
  colour = theme
  totalCells = cols * rows
  const bg = {
    selected: colour.cellSelected,
    outline: colour.cellOutline,
    preview: colour.cellPreview,
    default: colour.cellDefault
  }
  /* ──────────── build child map ──────────── */
  const cells = {}
  for (let y = 0; y < rows; ++y)
    for (let x = 0; x < cols; ++x)
      cells[keyOf(y, x)] = makeCell(y, x, bg)
  /* ───────── reset on outside-click  ───────── */
  const clearIfOutside = ev => {
    if (ev.target.closest('[data-grid-root]') === null) {
      if (sel.size) {
        sel.clear()
        last = ' , '
        updateSelectionRatio(rootSt)
        rootSt.update()
      }
    }
  }
  /* ─────────────────────────────────────────────────────────────────────────── */
  let rootSt
  /* ─────────────────────────────────────────────────────────────────────────── */
  return {
    tag: 'div',
    extend: [Europa],
    props: { 'data-grid-root': true }, // Add identifier for outside click detection
    /* card look - Fixed: Use themes.token for dynamic properties */
    style: (el, st) => ({
      background: themes.token(colour.cardBg, el, st),
      border: themes.token(colour.cardBorder, el, st),
      boxShadow: themes.token(colour.cardShadow, el, st),
      borderRadius: '16px', padding: '32px 36px 28px', display: 'flex',
      flexDirection: 'column', gap: '28px', minWidth: '570px'
    }),
    state: { hoverY: null, hoverX: null },
    /* ───────────────────────── header ───────────────────────── */
    Title: {
      tag: 'h3', extend: [Europa], text: 'Grid Selection',
      style: (el, st) => ({
        margin: 0, color: themes.token(colour.headerText, el, st),
        fontSize: '14px', fontWeight: 'bold'
      })
    },
    /* ───────────────────────── grid ───────────────────────── */
    GridBox: {
      tag: 'div',
      style: (el) => {
        const GAP = 4; const width = el?.clientWidth || 1000;
        const cellWidth = Math.floor((width - GAP * (cols - 1)) / cols);
        const cellHeight = 100 / rows;
        return {
          display: 'grid', maxWidth: '1000px', gridTemplateColumns: `repeat(${cols},${cellWidth}px)`,
          gridAutoRows: `${cellHeight}%`, gap: `${GAP}px`
        }
      },
      ...cells,
      on: {
        mouseleave: (_, _el, st) => {
          st.parent.update({ hoverY: null, hoverX: null })
          updateHoverRatio(st.root, null, null)
        }
      }
    },
    /* ───────────────────────── Footer ───────────────────────── */
    Footer: {
      tag: 'div',
      extend: [Europa],
      style: (
        el, st) => ({
          display: 'flex', justifyContent: 'space-between',
          fontSize: '12px', fontWeight: 'regular', color: themes.token(colour.footerText, el, st),
          marginTop: '4px', maxWidth: '940px', width: '100%'
        }),
      /* ──────────── Left side  >─────────────────────────────────────────────────── */
      Coords: { tag: 'span', text: () => `Selection coordinates: ${last}` },
      /* ───────────────────────────────────────────────────< Right side ──────────── */
      Total: { tag: 'span', text: () => `Total cells selected: ${sel.size}` }
    },
    /* ──────── Repaint cells on hover change ──────── */
    on: {
      init(_el, st) {
        rootSt = st // Start dynamic theme clock if needed
        if (themes.hasDynamicTheme(theme)) { themes.ensureClock(st) }
        window.addEventListener('click', clearIfOutside, true)
        document.body.addEventListener('click', clearIfOutside, true)
      },
      remove() {
        window.removeEventListener('click', clearIfOutside, true)
        document.body.removeEventListener('click', clearIfOutside, true)
      },
      state(ch, st) {
        if ('hoverY' in ch || 'hoverX' in ch || 'clock' in ch || 'selRatio' in ch || 'hiRatio' in ch)
          Object.values(registry).forEach(c => c.apply(visual(st, c.state.y, c.state.x)))
      }
    }
  }
}
/* ──────────── Creation Exporters ──────────── */
export const GridSelection = createGridSelection()
export const GridSelectionApp = { GridSelection }
