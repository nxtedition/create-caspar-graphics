import React, { useRef, useState } from 'react'
import { useCasparData, useCasparState } from 'caspar-graphics'
import { useTimeline, SplitText } from '../../../../graphics-kit'

const SplitTextExample = ({ preferredSize, minSize }) => {
  const ref = useRef()
  const { text } = useCasparData()
  const [isReady, setIsReady] = useState(false)

  const onLoad = timeline => {
    timeline.from('.char', {
      duration: 0.8,
      opacity: 0,
      scale: 0,
      y: 80,
      rotationX: 180,
      transformOrigin: '0% 50% -50',
      ease: 'back',
      stagger: 0.01
    })
  }

  const onStop = timeline => {
    timeline.reverse()
  }

  useTimeline(onLoad, onStop, { isReady })

  return (
    <div
      ref={ref}
      style={{
        background: '#fafafa',
        position: 'absolute',
        bottom: 80,
        left: 80,
        maxWidth: 700,
        overflow: 'hidden',
        padding: 10,
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontSize: 50
      }}
    >
      <SplitText
        value={text}
        lineClass='line'
        charClass='char'
        onReady={setIsReady}
      />
    </div>
  )
}

export const previewData = {
  text1: {
    text: 'Some text that should flip in'
  },
  text2: {
    text: 'Another text that should flip in over the other'
  }
}

export default SplitTextExample
