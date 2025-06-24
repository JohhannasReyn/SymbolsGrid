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

create(initGrid(16, 8, 'light'))

// import { create } from 'smbls'
// import { createGridSelection } from './components/GridSelection.js'
// import themes from './themes/index.js'
// const app = {
//   tag: 'div',
//   style: {
//     minHeight: '100vh',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
//   },

//   Main: {
//     extend: createGridSelection()
//   },
//   Footer: {
//     tag: 'footer',
//     style: {
//       position: 'fixed',
//       bottom: 0,
//       left: 0,
//       right: 0,
//       padding: '.5rem 1rem',
//       fontSize: '.8rem',
//       color: '#cbd5e1',
//       background: 'rgba(0,0,0,.6)',
//       textAlign: 'center'
//     },
//     text: 'Interactive Grid Selection with Symbols'
//   }
// }

// create(app)