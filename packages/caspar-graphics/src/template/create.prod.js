// HACK: we use webpack to resolve this to the correct path.
import Template from 'template'
import { createTemplate } from './create'

export default (function() {
  createTemplate(Template)
})()
