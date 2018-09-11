import { Base64 } from 'js-base64'
import { parseString as parseXML } from 'xml2js'
import queryString from 'querystring'

export function getQueryData() {
  const { search } = window.location
  return search
    ? Object.entries(queryString.parse(search.replace(/^\?/, '')) || {})
        .map(([key, value]) => ({
          [key]: value === 'true' ? true : value === 'false' ? false : value
        }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})
    : {}
}

export function parse(str) {
  try {
    const m = str.match(/<templateData>(.*)<\/templateData>/) || []
    let str2 = m[1]
    str2 = Base64.decode(str2)
    return JSON.parse(str2)
  } catch (err) {
    console.log('parse failed' + err.message)
    return normalize(parseXML2(str))
  }
}

function parseXML2(xml) {
  let params
  parseXML(xml, (err, result) => {
    if (err) {
      throw err
    } else {
      params = result
    }
  })

  const result = {}

  for (const val of params.templateData.componentData || []) {
    let componentData = {}

    for (const val2 of val.data || []) {
      componentData[val2.$.id] = val2.$.value
        .replace(/&amp;/g, '/&')
        .replace(/&lt;/g, '/<')
        .replace(/&gt;/g, '/>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "/'")
        .replace(/&#10;/g, '/\n')
        .replace(/&#13;/g, '/\r')
    }

    result[val.$.id] = componentData
  }

  return result
}

function normalize(data) {
  return Object.entries(data || {})
    .map(([key, value]) => ({
      [key]:
        value && (value.text || value.test) === 'true'
          ? true
          : (value.text || value.test) === 'false'
            ? false
            : value.text || value.test
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {})
}
