import React, { useState } from 'react'
import { useSize } from '@radix-ui/react-use-size'
import styles from './screen.module.css'

export const Screen = ({ children, background, image, aspectRatio }) => {
  const [ref, setRef] = useState()
  const containerSize = useSize(ref)

  let width = containerSize?.width
  let height = containerSize?.height

  if (aspectRatio && containerSize) {
    const containerAspectRatio = containerSize.width / containerSize.height
    const [rWidth, rHeight] = aspectRatio.split(':').map(Number)
    const ratio = rWidth / rHeight

    if (ratio > containerAspectRatio) {
      width = containerSize.width
      height = containerSize.width / ratio
    } else {
      width = containerSize.height * ratio
      height = containerSize.height
    }
  }

  return (
    <div ref={setRef} className={styles.container}>
      <div
        className={styles.screen}
        style={{
          background,
          width,
          height,
        }}
      >
        {containerSize ? children({ width, height }) : null}
        {image ? (
          <img
            src={image.url}
            className={styles.image}
            style={{ opacity: image.opacity ?? 0.3 }}
          />
        ) : null}
      </div>
    </div>
  )
}
