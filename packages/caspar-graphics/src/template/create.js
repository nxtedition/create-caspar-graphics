import React from 'react'
import ReactDOM from 'react-dom'
import { TemplateProvider } from '.'
import { ClassWrapper } from './class-wrapper'

export function createTemplate(Template) {
  if (!Template) {
    return
  }

  const isClassComponent = typeof Template.prototype?.render === 'function'

  if (isClassComponent && Template.previewDataList) {
    console.warn(
      '[Caspar Graphics] `static previewDataList` will be removed in a future version. Move it to a named export, e.g. `export const previewData = {}`.'
    )
    window.previewData = Template.previewDataList
  }

  const size = Template.size || process.env.SIZE
  const width = size?.width || 1920
  const height = size?.height || 1080
  const html = document.documentElement
  const body = document.body
  const container = document.getElementById('root')

  if (width) {
    html.style.height = body.style.height = container.style.height = `${height}px`
  }

  if (height) {
    html.style.width = body.style.width = container.style.width = `${width}px`
  }

  ReactDOM.render(
    <TemplateProvider name={document.title}>
      {isClassComponent ? <ClassWrapper Template={Template} /> : <Template />}
    </TemplateProvider>,
    container
  )
}
