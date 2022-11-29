import React, { useState } from 'react'
import { useSize } from '@radix-ui/react-use-size'
import styles from './screen.module.css'

export const Screen = ({ size, children, settings, image }) => {
  const [ref, setRef] = useState()
  const containerSize = useSize(ref)

  return (
    <div ref={setRef} className={styles.container}>
      <div
        className={styles.screen}
        style={{
          background: settings.background,
          width: size?.width || 0,
          height: size?.height || 0,
          transform: `scale(${calcScale(containerSize, size)})
          translate(-50%, -50%)`
        }}
      >
        {children}
        {settings.image ? (
          <img
            src={settings.image.url}
            className={styles.image}
            style={{ opacity: settings.image.opacity ?? 0.3 }}
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
