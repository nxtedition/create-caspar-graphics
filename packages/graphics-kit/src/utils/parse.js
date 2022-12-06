import { Base64 } from 'js-base64'

export function parse(raw) {
  if (typeof raw === 'object') {
    return raw
  }

  if (typeof raw !== 'string') {
    return null
  }

  try {
    return raw.startsWith('{') ? JSON.parse(raw) : parseTemplateData(raw)
  } catch (err) {
    console.log('parse failed:' + err.message)
    return null
  }
}

function parseTemplateData(string) {
  const xmlDoc = new window.DOMParser().parseFromString(string, 'text/xml')
  const componentData = xmlDoc.getElementsByTagName('componentData')

  if (!componentData.length) {
    const base64String = string.match(/<templateData>(.*)<\/templateData>/)?.[1]
    return JSON.parse(Base64.decode(base64String))
  }

  const result = {}

  for (const element of componentData) {
    const obj = {}

    for (const data of el.getElementsByTagName('data') || []) {
      obj[data.getAttribute('id')] = data.getAttribute('value')
    }

    result[element.getAttribute('id')] = obj
  }

  return result
}
