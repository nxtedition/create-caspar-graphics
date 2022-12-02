import React, { useState } from 'react'
import { useSize } from '@radix-ui/react-use-size'
import styles from './screen.module.css'

export const Screen = ({
  children,
  background,
  size = { width: 1920, height: 1080 },
  image
}) => {
  const [ref, setRef] = useState()
  const containerSize = useSize(ref)

  return (
    <div ref={setRef} className={styles.container}>
      <div
        className={styles.screen}
        style={{
          background,
          width: size?.width || 0,
          height: size?.height || 0,
          transform: `scale(${calcScale(containerSize, size)})
          translate(-50%, -50%)`
        }}
      >
        {children}
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

function calcScale(container, template) {
  if (!container || !template) {
    return 1
  }

  const ratio = container.width / container.height
  return ratio >= 16 / 9
    ? container.height / template.height
    : container.width / template.width
}
