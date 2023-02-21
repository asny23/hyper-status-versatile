const { exec } = require('child_process')

const state = {
  cwd: '',
}

const directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|\u001b]+)/im
const escapeRegex = /[\u0000-\u001f]/g
let pid

const setCwd = (pid, action) => {
  if (process.platform == 'win32') {
    if (action && action.data) {
      let path = directoryRegex.exec(action.data)
      if(path) {
        state.cwd = path[0].replaceAll(escapeRegex, '')
      }
    }
  } else {
    exec(`lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`, (_err, stdout) => {
      state.cwd = stdout.trim()
    })
  }
}

exports.middleware = (store) => (next) => (action) => {
  const uids = store.getState().sessions.sessions
  if (action.type === 'SESSION_SET_XTERM_TITLE') {
    pid = uids[action.uid].pid
  }
  if (action.type === 'SESSION_ADD_DATA') {
    const { data } = action
    if (data.indexOf("\r") >= 0) {
      setCwd(pid, action)
    }
  }
  next(action)
}

exports.decorateConfig = (config) => {
  const colorFG = config.foregroundColor || '#fff'
  return Object.assign({}, config, {
    css: `
      ${config.css || ''}
      .terms_terms {
        margin-bottom: 32px;
      }
      .hyper-status-versatile {
        display: flex;
        justify-content: space-between;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        height: 32px;
        color: ${colorFG}
      }
    `
  })
}

exports.decorateHyper = (Hyper, { React }) => {
  return class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = state
    }

    render() {
      const { customChildren } = this.props
      const existingChildren = customChildren ? customChildren instanceof Array ? customChildren : [customChildren] : []

      return React.createElement(
        Hyper,
        Object.assign({}, this.props, {
          customInnerChildren: existingChildren.concat(
            React.createElement('footer', { className: 'hyper-status-versatile' },
              React.createElement('div', { className: 'sample', title: 'sample title' }, 'this is sample!'),
              React.createElement('div', { className: 'cwd', title: 'cwd' }, this.state.cwd)
            )
          )
        })
      )
    }
  }
}
