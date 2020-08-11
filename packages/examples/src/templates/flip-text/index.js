import React, { useRef, useState } from 'react'
import { useCasparData, useCasparState } from 'caspar-graphics'
import { Flip, useTimeline } from '../../../../graphics-kit'

const FlipText = () => {
  const ref = useRef()

  const onLoad = timeline => {
    timeline.from(ref.current, 0.25, { y: 200 })
  }

  const onStop = timeline => {
    timeline.to(ref.current, 0.2, { y: 200 })
  }

  useTimeline(onLoad, onStop)

  const { text } = useCasparData()

  return (
    <div
      ref={ref}
      css={`
        background: papayawhip;
        width: 1000px;
        height: 100px;
        font-size: 42px;
        font-weight: 500;
        position: absolute;
        bottom: 60px;
        left: 60px;
        display: flex;
        align-items: center;
        padding: 10px;
        box-sizing: border-box;
      `}
    >
      <Flip>{text}</Flip>
    </div>
  )
}

FlipText.previewData = {
  text1: {
    text: 'Some text that should flip in'
  },
  text2: {
    text: 'Another text that should flip in over the other'
  }
}

export default FlipText
