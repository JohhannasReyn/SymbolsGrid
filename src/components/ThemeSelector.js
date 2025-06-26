import * as themes from '../themes/index.js'
import { Europa } from './GridSelection.js'
const themeList = [
  { key: 'light', icon: '☀️', name: 'Light' },
  { key: 'dark', icon: '🌙', name: 'Dark' },
  { key: 'neon', icon: '⚡', name: 'Neon' },
  { key: 'vibrant', icon: '🌈', name: 'Vibrant' },
  { key: 'ocean', icon: '🌊', name: 'Ocean' }
]
let currentTheme = 'ocean'
let onThemeChange = () => { }
/* ---------------------------------------------------------------------------
      Component Builder:   "createThemeButton"
------------------------------------------------------------------------------ */
function createThemeButton(theme) {
  return {
    tag: 'button',
    extend: [Europa],
    style: (el, st) => ({
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      padding: '8px 6px', borderRadius: '8px',
      background: currentTheme === theme.key
        ? themes.token(themes[currentTheme].cellOutline, el, st)
        : themes.token(themes[currentTheme].cellDefault, el, st),
      border: currentTheme === theme.key
        ? `2px solid ${themes.token(themes[currentTheme].cellSelected, el, st)}`
        : `${themes.token(themes[currentTheme].cellBorder, el, st)}`,
      color: themes.token(themes[currentTheme].headerText, el, st),
      transition: 'all 0.2s ease', cursor: 'pointer', fontSize: '10px',
      fontWeight: currentTheme === theme.key ? 'bold' : 'normal',
      minWidth: '50px', minHeight: '50px', position: 'relative'
    }),
    on: {
      click: (_, el, st) => {
        console.log(`Theme button clicked: ${theme.key}`)
        currentTheme = theme.key; onThemeChange(theme.key); st.root.update()// Force update the entire theme selector
      },
      mouseenter: (_, el, st) => {
        if (currentTheme !== theme.key) {
          el.style.background = themes.token(themes[currentTheme].cellPreview, el, st);
          el.style.transform = 'scale(1.05)';
        }
      },
      mouseleave: (_, el, st) => {
        if (currentTheme !== theme.key) {
          el.style.background = themes.token(themes[currentTheme].cellDefault, el, st);
          el.style.transform = 'scale(1)';
        }
      }
    },
    Icon: { tag: 'span', text: theme.icon, style: { fontSize: '18px', lineHeight: 'center' } },
    Label: { tag: 'span', text: theme.name, style: { fontSize: '8px', lineHeight: '1', textAlign: '1' } },
    // Active indicator
    ...(currentTheme === theme.key ? {
      ActiveDot: {
        tag: 'div',
        style: (el, st) => ({
          position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%',
          background: themes.token(themes[currentTheme].cellSelected, el, st),
          boxShadow: `0 0 0 1px ${themes.token(themes[currentTheme].cardBg, el, st)}`
        })
      }
    } : {})
  }
}
/* ---------------------------------------------------------------------------
      Component Builder:   "createThemeSelector"
------------------------------------------------------------------------------ */
export function createThemeSelector(initialTheme = 'ocean', changeCallback = () => { }) {
  currentTheme = initialTheme
  onThemeChange = changeCallback
  return {
    tag: 'div',
    extend: [Europa],
    style: (el, st) => ({
      position: 'fixed', top: '20px', right: '20px', zIndex: '1000',
      background: themes.token(themes[currentTheme].cardBg, el, st),
      border: `2px solid ${themes.token(themes[currentTheme].cardBorder, el, st)}`,
      boxShadow: themes.token(themes[currentTheme].cardShadow, el, st),
      borderRadius: '12px', padding: '10px', width: '80px', height: 'auto',
      transition: 'all 0.3s ease', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(2px)'
    }),
    ThemeGrid: {
      tag: 'div',
      style: (el, st) => ({
        display: 'grid', width: '73px', height: '280px', gridTemplateRows: 'repeat(5, 1fr)',
        gridTemplateColumns: '1fr', gap: '8px', marginTop: '12px'
      }),
      LightBtn: createThemeButton({ key: 'light', icon: '☀️', name: 'Light' }),
      DarkBtn: createThemeButton({ key: 'dark', icon: '🌙', name: 'Dark' }),
      NeonBtn: createThemeButton({ key: 'neon', icon: '⚡', name: 'Neon' }),
      VibrantBtn: createThemeButton({ key: 'vibrant', icon: '🌈', name: 'Vibrant' }),
      OceanBtn: createThemeButton({ key: 'ocean', icon: '🌊', name: 'Ocean' })
    },
    Title: {
      tag: 'div',
      text: 'Themes',
      style: (el, st) => ({
        marginTop: '10px', textAlign: 'center', fontSize: '10px',
        textColor: themes.token(themes[currentTheme].text, el, st),
        color: themes.token(themes[currentTheme].footerText, el, st),
        opacity: 0.8
      })
    }
  }
}
// Export helper for updating current theme externally
export function updateCurrentTheme(newTheme) {
  console.log('Updating current theme to:', newTheme)
  currentTheme = newTheme
}
