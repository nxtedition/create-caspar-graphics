import { createTemplate } from './create'

export default (async function() {
  const { default: Template, previewData, previewImages } = await import(
    process.env.DEV_TEMPLATES_DIR + '/' + document.title
  )

  if (!Template) {
    return
  }

  window.previewData = previewData
  window.previewImages = previewImages

  const isClassComponent = typeof Template.prototype?.render === 'function'

  // COMPAT: Preview Data
  if (isClassComponent && !previewData) {
    if (Template.previewDataList) {
      console.warn(
        '[Caspar Graphics] `static previewDataList` will be removed in a future version. Move it to a named export, e.g. `export const previewData = {}`.'
      )
      window.previewData = Template.previewDataList
    } else if (Template.previewData) {
      console.warn(
        '[Caspar Graphics] `static previewData` will be removed in a future version. Move it to a named export, e.g. `export const previewData = {}`.'
      )
      window.previewData = Template.previewData
    }
  }

  createTemplate(Template)
})()
