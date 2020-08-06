import React from 'react'
import ReactDOM from 'react-dom'
import { TemplateProvider } from './'
import { ClassWrapper } from './class-wrapper'

export default (async function() {
  const { default: Template } = await import(
    process.env.DEV_TEMPLATES_DIR + '/' + document.title
  )

  if (!Template) {
    return
  }

  const isClassComponent = typeof Template.prototype?.render === 'function'

  if (isClassComponent && Template.previewDataList) {
    console.warn(
      '[Caspar Graphics] `static previewDataList` will be removed in a future version. Move it to a named export, e.g. `export const previewData = {}`.'
    )
    Template.previewData = Template.previewDataList
  }

  const size = Template.size || process.env.SIZE
  const width = size?.width || 1920
  const height = size?.height || 1080
  const html = document.documentElement
  const body = document.body
  const container = document.getElementById('root')

  window.previewData = Template.previewData
  window.previewImages = Template.previewImages

  if (width) {
    html.style.height = body.style.height = container.style.height = `${height}px`
  }

  if (height) {
    html.style.width = body.style.width = container.style.width = `${width}px`
  }

  ReactDOM.render(
    <TemplateProvider name={Template.name}>
      {isClassComponent ? <ClassWrapper Template={Template} /> : <Template />}
    </TemplateProvider>,
    container
  )
})()
