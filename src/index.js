import { create } from 'smbls'
import { createGridSelection } from './components/GridSelection.js'
import { createThemeSelector, updateCurrentTheme } from './components/ThemeSelector.js'
import * as themes from './themes/index.js'
let currentTheme = 'ocean' // ------------------------------------- Default theme
let appRoot = null
function initGrid(cols = 16, rows = 8, themeName = 'ocean') {
  currentTheme = themeName
  const theme = themes[themeName] || themes.default
  return {
    tag: 'div',
    style: (el, st) => ({
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: themes.token(theme.background, el, st),
      transition: 'background 0.3s ease'
    }),
    // ------------------------------------------------------------- Initialize state for dynamic themes
    state: {
      hoverY: null, hoverX: null, clock: 0,
      selRatio: 0, hiRatio: 0, currentTheme: themeName
    },
    // ------------------------------------------------------------- Theme Selector (floating)
    ThemeSelector: {
      extends: createThemeSelector(themeName, (newTheme) => {
        // --------------------------------------------------------  Handle theme change
        handleThemeChange(newTheme)
      })
    },
    // ------------------------------------------------------------- Main Grid Component
    Main: { extends: createGridSelection(cols, rows, theme) },

    // ------------------------------------------------------------- Update handler for theme changes and dynamic effects
    on: {
      init: (el, st) => {
        appRoot = st;
        console.log(`Initializing app with theme: ${themeName}`)
        // ---------------------------------------------------------- Start dynamic theme clock if needed
        if (themes.hasDynamicTheme(theme)) {
          console.log('Starting dynamic theme clock for:', themeName)
          themes.ensureClock(st)
          // -------------------------------------------------------- Force an initial update after a short delay
          setTimeout(() => {
            console.log('Forcing initial theme update')
            themes.forceThemeUpdate()
          }, 100)
        }
      },
      state: (changes, st) => {
        // ---------------------------------------------------------- Handle clock updates for dynamic backgrounds
        if ('clock' in changes) {
          console.log('Clock state updated to:', changes.clock)
          // -------------------------------------------------------- Force background re-render for dynamic themes immediately
          if (themes.hasDynamicTheme(themes[currentTheme])) {
            // ------------------------------------------------------ Use requestAnimationFrame for smooth updates
            requestAnimationFrame(() => {
              st.apply()
            })
          }
        }
        // ----------------------------------------------------------- Propagate other state changes
        if ('currentTheme' in changes) st.apply()
      }
    }
  }
}
// ------------------------------------------------------------------- Theme change handler
function handleThemeChange(newThemeName) {
  if (!themes[newThemeName]) {
    console.error(`Theme "${newThemeName}" not found`)
    return
  }
  console.log(`Changing theme from ${currentTheme} to ${newThemeName}`)
  currentTheme = newThemeName
  // ------------------------------------------------------------------- Stop any existing clocks
  themes.stopClock()
  // ------------------------------------------------------------------- Update the theme selector's internal state
  updateCurrentTheme(newThemeName)
  // ------------------------------------------------------------------- Recreate the entire app with new theme
  const appContainer = document.body.querySelector('#app') || document.body
  appContainer.innerHTML = '' // Clear existing content
  // ------------------------------------------------------------------- Create new app instance with updated theme
  const newApp = initGrid(16, 8, newThemeName)
  create(newApp, appContainer)
}
// -------------------------------------------------------------------Initialize the app
console.log('Creating initial app')
const app = initGrid(16, 8, currentTheme)
create(app)
