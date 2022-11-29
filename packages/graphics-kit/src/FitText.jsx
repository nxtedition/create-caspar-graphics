import React, { useRef, useLayoutEffect, useState } from 'react'

export const FitText = ({
  fontSize,
  minSize = 0,
  children,
  onReady,
  style,
  ...props
}) => {
  const fitProps = useFitText({ fontSize, minSize, onReady })

  return (
    <div ref={fitProps.ref} style={{ ...style, ...fitProps.style }} {...props}>
      {children}
    </div>
  )
}

export function useFitText({
  fontSize: preferredSize,
  minSize = 0,
  onReady,
  ...props
}) {
  const ref = useRef()
  const [fontSize, setFontSize] = useState(preferredSize)

  useLayoutEffect(() => {
    if (
      ref.current.scrollWidth > ref.current.clientWidth &&
      fontSize > minSize
    ) {
      setFontSize(fontSize - 1)
    } else {
      onReady?.(true)
    }
  })

  const style = { fontSize, overflow: 'hidden' }
  return { ref, style }
}
