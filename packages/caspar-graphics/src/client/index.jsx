import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'

if (!window.reactRoot) {
  window.reactRoot = createRoot(document.getElementById('root'))
}

window.reactRoot.render(createElement(App, { updates: true }))
