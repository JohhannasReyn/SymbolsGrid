import { create } from 'smbls'
import { createGridSelection } from './components/GridSelection.js'
import * as themes from './themes/index.js'

function initGrid(...args) {
  let cols = 10, rows = 10, theme = themes.default

  if (args.length === 1 && typeof args[0] === 'number') {
    cols = rows = args[0]
  } else if (args.length === 2) {
    if (typeof args[1] === 'string' && themes[args[1]]) {
      cols = rows = args[0]
      theme = themes[args[1]]
    } else {
      [cols, rows] = args
    }
  } else if (args.length === 3) {
    [cols, rows, theme] = [args[0], args[1], themes[args[2]] || themes.default]
  }

  return {
    tag: 'div',
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.background
    },
    Main: {
      extends: createGridSelection(cols, rows, theme)
    }
  }
}
// theme choices: light, dark, neon, vibrant, ocean
create(initGrid(16, 8, 'light'))
