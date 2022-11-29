import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import FontFaceObserver from 'fontfaceobserver'
import { useDelayPlay } from './TemplateProvider'

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

export function useFont({ src, weight, style }) {
  const key = src ? JSON.stringify(src) : null
  const [font, resume] = useDelayPlay({ key })

  useLayoutEffect(() => {
    const fonts = Array.isArray(src) ? src : [{ path: src, weight, style }]

    if (!Array.isArray(fonts) || !fonts.length) {
      return
    }

    async function loadFonts() {
      const name = fonts[0].path
        ?.split('/')
        ?.slice(-1)[0]
        ?.split('.')[0]
      const fontFaces = await Promise.all(
        fonts.map(font => {
          const fontFile = new FontFace(name, `url(${src})`, { weight, style })
          document.fonts.add(fontFile)
          return fontFile.load()
        })
      )

      resume(fontFaces[0].family)
    }

    try {
      loadFonts()
    } catch (err) {
      console.error('Failed to load font ' + name + ':', err)
    }
  }, [key, weight, style, resume])

  return {
    style: { fontFamily: font, visibility: font ? 'visible' : 'hidden' }
  }
}
