export const Europa = {
  props: { style: { fontFamily: `'Europa', Helvetica, sans-serif` } }
}

/* ─────────────── shared state ─────────────── */
const registry = {}
const sel = new Set()
let last = ' , '
let colour = {}
/* helpers */
const keyOf = (y, x) => `C_${y}_${x}`

function visual(root, y, x) {
  const k = keyOf(y, x)
  if (sel.has(k)) return 'selected'
  const { hoverY, hoverX } = root.state
  if (hoverY != null && hoverX != null && y <= hoverY && x <= hoverX)
    return (hoverY === y || hoverX === x) ? 'outline' : 'preview'
  return 'default'
}

/* ─────────────── cell factory ─────────────── */
function makeCell(y, x, bg) {
  const key = keyOf(y, x)
  return {
    key,
    tag: 'div',
    state: { y, x },
    extend: [Europa],
    style: (_e, _st, ctx) => ({
      width: '100%', minHeight: '100%', minWidth: '45px', minHeight: '45px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid ${colour.cellBorder}`,
      background: bg[visual(ctx.root || ctx, y, x)],
      transition: 'background .12s',
      borderRadius: '4px'
    }),
    on: {
      init: (_e, st) => { registry[key] = st },
      mouseenter: (_, _el, st) => st.root.update({ hoverY: y, hoverX: x }),
      mouseleave: (_, _el, st) => st.root.update({ hoverY: null, hoverX: null }),
      click: (_, _el, st) => {
        sel.clear()
        for (let ry = 0; ry <= y; ++ry)for (let rx = 0; rx <= x; ++rx)sel.add(keyOf(ry, rx))
        last = `${y + 1},${x + 1}`
        st.root.update()
      }
    }
  }
}

/* ─────────────── main factory ─────────────── */
export function createGridSelection(cols = 16, rows = 8, theme = {}) {
  colour = theme

  const bg = {
    selected: colour.cellSelected,
    outline: colour.cellOutline,
    preview: colour.cellPreview,
    default: colour.cellDefault
  }
  /* build child map */
  const cells = {}
  for (let y = 0; y < rows; ++y)
    for (let x = 0; x < cols; ++x) cells[keyOf(y, x)] = makeCell(y, x, bg)

  /* outside-click guard */
  const clearIfOutside = ev => {
    if (ev.target.closest('[data-grid-root]') === null) {
      if (sel.size) {
        sel.clear(); last = ' , '
        rootSt.update()
      }
    }
  }

  let rootSt

  return {
    tag: 'div',
    extend: [Europa],

    /* card look */
    style: {
      background: colour.cardBg,
      border: `1px solid ${colour.cardBorder}`,
      boxShadow: colour.cardShadow,
      borderRadius: '16px',
      padding: '32px 36px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      minWidth: '570px'
    },

    state: { hoverY: null, hoverX: null },

    /* ─────────────── header ─────────────── */
    Title: {
      tag: 'h3',
      extend: [Europa],
      text: 'Grid Selection',
      style: { margin: 0, color: colour.headerText, fontSize: '14px ', fontWeight: 'bold' }
    },

    /* ─────────────── grid ─────────────── */
    GridBox: {
      tag: 'div',
      style: (el) => {
        const GAP = 4;
        const width = el?.clientWidth || 1000;
        const cellWidth = Math.floor((width - GAP * (cols - 1)) / cols);
        const cellHeight = 100 / rows;
        return {
          display: 'grid',
          maxWidth: '1000px',
          gridTemplateColumns: `repeat(${cols},${cellWidth}px)`,
          gridAutoRows: `${cellHeight}%`,
          gap: `${GAP}px`
        }
      },
      ...cells,
      on: { mouseleave: (_, _el, st) => st.parent.update({ hoverY: null, hoverX: null }) }
    },

    /* ─────────────── footer ─────────────── */
    Footer: {
      tag: 'div',
      extend: [Europa],
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        fontWeight: 'regular',
        color: colour.footerText,
        marginTop: '4px',
        maxWidth: '940px',
        width: '100%'
      },
      /* [left side] ────────────────────────────── */
      Coords: {
        tag: 'span',
        text: () => `Selection coordinates: ${last}`
      },

      /* ────────────────────────────── [right side] */
      Total: {
        tag: 'span',
        text: () => `Total cells selected: ${sel.size}`
      }
    },

    /* repaint cells on hover change */
    on: {
      init(_el, st) {
        rootSt = st
        window.addEventListener('click', clearIfOutside, true)
        document.body.addEventListener('click', clearIfOutside, true)
      },
      remove() {
        window.removeEventListener('click', clearIfOutside, true)
        document.body.removeEventListener('click', clearIfOutside, true)
      },
      state(ch, st) {
        if ('hoverY' in ch || 'hoverX' in ch)
          Object.values(registry).forEach(c =>
            c.apply(visual(st, c.state.y, c.state.x)))
      }
    }
  }
}

export const GridSelection = createGridSelection()
export const GridSelectionApp = { GridSelection }

