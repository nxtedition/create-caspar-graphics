import React, { useRef, useState, useLayoutEffect } from 'react'

export const SplitText = ({ value, ...props }) => {
  return value ? <SplitPrimitive key={value} value={value} {...props} /> : null
}

const SplitPrimitive = ({
  value,
  lineClass = 'line',
  charClass = 'char',
  onReady
}) => {
  const [ref, setRef] = useState()
  const [lines, setLines] = useState()
  const [chars, setChars] = useState()

  useLayoutEffect(() => {
    if (!ref) {
      return
    }

    const lines = [[]]
    let top

    ref.childNodes?.forEach((el, index) => {
      if (el.offsetTop > top) {
        lines.push([el.innerText])
      }

      lines.at(-1).push(el.innerText)
      top = el.offsetTop
    })

    setLines(lines)
    onReady?.(true)
  }, [ref, onReady])

  return lines?.length ? (
    lines.map((line, index) => (
      <div key={index} className={lineClass}>
        {line.map((char, index) => (
          <div
            key={index}
            className={charClass}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {char}
          </div>
        ))}
      </div>
    ))
  ) : (
    <div ref={setRef} style={{ opacity: 0 }}>
      {value.split('').map((char, index) => (
        <span key={index}>{char}</span>
      ))}
    </div>
  )
}
