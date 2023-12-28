import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useId
} from 'react'
import FontFaceObserver from 'fontfaceobserver'
import { useDelayPlay } from './use-caspar'

export const useFontObserver = (...args) => {
  const [loaded, setLoaded] = React.useState(false)
  const stringifiedArgs = args ? JSON.stringify(args) : ''

  React.useEffect(() => {
    if (!stringifiedArgs) {
      return
    }

    const args = JSON.parse(stringifiedArgs)
    const fonts = Array.isArray(args[0]) ? args[0] : args

    Promise.all(
      fonts.map(({ family, ...opts }) =>
        new FontFaceObserver(family, opts).load()
      )
    )
      .then(() => {
        setLoaded(true)
      })
      .catch(err => {
        console.error('Unable to load font:', err)
      })

    return () => {
      setLoaded(false)
    }
  }, [stringifiedArgs])

  return loaded
}

function convertToISO10646(inputString) {
  let result = ''
  for (let i = 0; i < inputString.length; i++) {
    const charCode = inputString.charCodeAt(i)
    if (charCode > 127) {
      // Convert non-ASCII characters to Unicode escape sequences
      result += `\\u${charCode
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')}`
    } else {
      result += inputString[i]
    }
  }
  return result
}

export function useFont({ name, src, weight, style }) {
  const key = src ? JSON.stringify(src) : null
  const [font, resume] = useDelayPlay({ key })
  const id = useId().replace(/:/g, '-') // ":" aren't valid in a font family name
  const fontName = name ?? id

  useLayoutEffect(() => {
    const fonts = Array.isArray(src) ? src : [{ path: src, weight, style }]

    if (!Array.isArray(fonts)) {
      return
    }

    async function loadFonts() {
      const fontFaces = await Promise.all(
        fonts.map(({ path, weight, style }) => {
          const fontFile = new FontFace(fontName, `url(${path})`, {
            weight,
            style
          })
          document.fonts.add(fontFile)
          return fontFile.load()
        })
      )
      resume(fontFaces[0].family)
    }

    try {
      loadFonts()
    } catch (err) {
      console.error('Failed to load font ' + fontName + ':', err)
    }
  }, [key, weight, style, resume])

  return {
    style: { fontFamily: font, visibility: font ? 'visible' : 'hidden' }
  }
}
