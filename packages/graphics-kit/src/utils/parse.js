import { Base64 } from 'js-base64'

export function parse(raw) {
  if (typeof raw === 'object') {
    return raw
  }

  if (typeof raw !== 'string') {
    return null
  }

  try {
    if (raw.startsWith('<')) {
      return parseXml(raw)
    }

    if (raw.startsWith('{')) {
      return JSON.parse(raw)
    }

    const base64String = str.match(/<templateData>(.*)<\/templateData>/)?.[1]
    return JSON.parse(Base64.decode(base64String))
  } catch (err) {
    console.log('parse failed:' + err.message)
    return null
  }
}

function parseXml(xmlString) {
  const xmldDoc = new window.DOMParser().parseFromString(xmlString, 'text/xml')
  const result = {}

  for (const element of xmlDoc.getElementsByTagName('componentData')) {
    const obj = {}

    for (const data of el.getElementsByTagName('data') || []) {
      obj[data.getAttribute('id')] = data.getAttribute('value')
    }

    result[element.getAttribute('id')] = obj
  }

  return result
}
