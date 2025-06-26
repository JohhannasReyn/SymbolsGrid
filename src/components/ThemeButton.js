// ThemeButton.js
import * as themes from '../themes/index.js'
import { Europa } from './GridSelection.js'

let currentTheme = 'light'
export const setCurrentTheme = (theme) => (currentTheme = theme)
/* ---------------------------------------------------------------------------
      Class:   "ThemeButton"
------------------------------------------------------------------------------ */
export function ThemeButton({ icon, themeKey, onSelectTheme }) {
  return {
    tag: 'button',
    extend: [Europa],
    style: (el, st) => ({
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '22px', padding: '10px', borderRadius: '8px',
      background: currentTheme === themeKey
        ? themes.token(themes[currentTheme].cellOutline, el, st)
        : themes.token(themes[currentTheme].cellDefault, el, st),
      border: currentTheme === themeKey
        ? `2px solid ${themes.token(themes[currentTheme].cellSelected, el, st)}`
        : `1px solid ${themes.token(themes[currentTheme].cellBorder, el, st)}`,
      color: themes.token(themes[currentTheme].headerText, el, st),
      transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative'
    }),
    on: {
      click: (_, el, st) => {
        setCurrentTheme(themeKey); onSelectTheme(themeKey); st.root?.update?.()
      },
      mouseenter: (_, el, st) => {
        if (currentTheme !== themeKey) {
          el.style.background = themes.token(themes[currentTheme].cellPreview, el, st)
          el.style.transform = 'scale(1.1)'
        }
      },
      mouseleave: (_, el) => { el.style.background = ''; el.style.transform = 'scale(1)'; }
    },
    Icon: { tag: 'span', text: icon, style: { fontSize: '24px' } }
  }
}
