import React, { useRef, useState } from 'react'
import { useCasparData, useCasparState } from 'caspar-graphics'
import { FitText, useTimeline, useFitText } from '../../../../graphics-kit'

const FitTextExample = () => {
  const ref = useRef()
  const { text } = useCasparData()
  const [isReady, setIsReady] = useState(false)

  const onLoad = timeline => {
    timeline.from(ref.current, { opacity: 0, y: 200 })
  }

  const onStop = timeline => {
    timeline.reverse()
  }

  useTimeline(onLoad, onStop, { isReady })

  return (
    <div
      ref={ref}
      style={{
        opacity: isReady ? 1 : 0,
        background: '#fafafa',
        position: 'absolute',
        bottom: 80,
        left: 80,
        height: 100,
        width: 900,
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap'
      }}
    >
      <FitText fontSize={50} onReady={setIsReady}>
        {text}
      </FitText>
    </div>
  )
}

export const previewData = {
  example: {
    text: "Some text that doesn't fit with font size set to 50px"
  }
}

export default FitTextExample
