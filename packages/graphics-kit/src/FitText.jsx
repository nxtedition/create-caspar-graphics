import React, { useRef, useLayoutEffect, useState } from 'react'

export const FitText = ({
  text,
  preferredSize,
  minSize = 0,
  step = 1,
  unit = 'px',
  style,
  ...props
}) => {
  const ref = useRef()
  const [fontSize, setFontSize] = useState(`${preferredSize}${unit}`)

  useLayoutEffect(() => {
    const el = ref.current
    let size = preferredSize

    while (el.scrollWidth > el.clientWidth && size > minSize) {
      size -= step
      el.style.fontSize = `${size}${unit}`
    }

    setFontSize(el.style.fontSize)
  }, [preferredSize, minSize, step, unit])

  return (
    <div
      ref={ref}
      style={{
        ...style,
        fontSize,
        overflow: 'hidden'
      }}
      {...props}
    >
      {text}
    </div>
  )
}
