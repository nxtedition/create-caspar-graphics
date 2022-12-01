import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from 'react'
import * as ReactDOM from 'react-dom/client'
import { TemplateProvider } from './TemplateProvider'

let root = null

export const render = (Template, options) => {
  let {
    container = document.getElementById('root'),
    cssReset = true,
    name = Template.name
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
    root = ReactDOM.createRoot(container)
  }

  root.render(
    React.createElement(
      TemplateProvider,
      { name },
      React.createElement(Template)
    )
  )
}
