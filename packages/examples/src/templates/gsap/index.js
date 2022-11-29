import React, { useRef } from 'react'
import { useCasparData } from 'caspar-graphics'
import { useTimeline } from '../../../../graphics-kit'
import image from './gsap.png'

const GSAP = () => {
  const ref = useRef()
  const { text } = useCasparData()

  const onLoad = timeline => {
    timeline.from(ref.current, 0.25, { y: 150 })
  }

  const onStop = timeline => {
    timeline.to(ref.current, 0.2, { y: 100 })
  }

  useTimeline(onLoad, onStop)

  return (
    <div
      ref={ref}
      css={`
        display: flex;
        align-items: center;
        padding-left: 20px;
        bottom: 40px;
        left: 100px;
        height: 100px;
        width: 600px;
        background: #673ab7;
        color: white;
        position: absolute;
        font-weight: bold;
        font-size: 44px;
        border-radius: 4px;
      `}
    >
      {text}
    </div>
  )
}

GSAP.previewData = {
  ref: {
    text: 'GSAP Text'
  },
  longText: {
    text: 'GSAP Text with some extra longer text'
  }
}

GSAP.previewImages = {
  ref: image
}

export default GSAP
