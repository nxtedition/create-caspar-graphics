import React from 'react'
import FontFaceObserver from 'fontfaceobserver'

export const useFontObserver = (...args) => {
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
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
  }, [])

  return loaded
}
