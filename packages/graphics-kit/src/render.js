import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

import { TemplateProvider } from './TemplateProvider'

let root = null

export const render = (Template, options) => {
  let {
    container = document.getElementById('root'),
    cssReset = true,
    name = Template.name,
  } = options || {}

  if (!container) {
    container = document.createElement('div')
    container.id = 'root'
    document.body.appendChild(container)
  }

  if (cssReset) {
    const reset = ` 
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      margin: 0;
    `
    document.body.style.cssText = reset
    container.style.cssText = reset
  }

  if (!root) {
    root = createRoot(container)
  }

  flushSync(() => {
    root.render(
      createElement(
        TemplateProvider,
        {
          name,
          windowSize: { width: window.innerWidth, height: window.innerHeight },
        },
        createElement(Template),
      ),
    )
  })
}
