import ReactDOM from 'react-dom'
import React from 'react'
import Caspar from './caspar'
;(function() {
  // Set window size
  const mode = process.env.MODE
  const is720 = mode.startsWith('720')
  const width = is720 ? 1280 : 1920
  const height = is720 ? 720 : 1080
  const html = document.documentElement
  const body = document.body
  const container = document.getElementById('app')
  html.style.height = body.style.height = container.style.height = `${height}px`
  html.style.width = body.style.width = container.style.width = `${width}px`

  const template = window.template && window.template.default

  if (!template) {
    return
  }

  ReactDOM.render(
    <Caspar name={document.title} template={template} />,
    container
  )
})()
