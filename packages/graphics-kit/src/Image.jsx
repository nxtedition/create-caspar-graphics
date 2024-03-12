import React, { useState } from 'react'
import { useDelayPlay } from './use-caspar'

export function Image({ src, style }) {
  const image = useImage({ src })

  return (
    <img
      src={image?.src}
      style={{ visibility: image?.src ? 'visible' : 'hidden', ...style }}
    />
  )
}

export function useImage({ src }) {
  const [image, resume] = useDelayPlay({ key: src })

  React.useEffect(() => {
    if (!src) {
      return
    }

    const img = new window.Image()
    img.src = src
    img
      .decode()
      .then(() => {
        resume({ src })
      })
      .catch((err) => {
        console.error('Failed to load image: ' + src)
        console.error(err)
      })
  }, [src, resume])

  return image
}
