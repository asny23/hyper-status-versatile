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
    }

    render() {
      const { customChildren } = this.props
      const existingChildren = customChildren ? customChildren instanceof Array ? customChildren : [customChildren] : []

      return React.createElement(
        Hyper,
        Object.assign({}, this.props, {
          customInnerChildren: existingChildren.concat(
            React.createElement('footer', { className: 'hyper-status-versatile' },
              React.createElement('div', { className: 'sample', title: 'sample title' }, 'this is sample!')
            )
          )
        })
      )
    }
  }
}
