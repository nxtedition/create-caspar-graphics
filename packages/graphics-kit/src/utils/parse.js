import { Base64 } from 'js-base64'

export function parse(str) {
  try {
    const base64String = str.match(/<templateData>(.*)<\/templateData>/)?.[1]
    return JSON.parse(Base64.decode(base64String))
  } catch (err) {
    console.log('parse failed:' + err.message)
    return null
  }
}
