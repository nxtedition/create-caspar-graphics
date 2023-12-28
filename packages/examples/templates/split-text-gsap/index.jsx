import React from 'react'
import {
  render,
  SplitText,
  GsapTimeline,
  useCasparData
} from '@nxtedition/graphics-kit'
import './style.css'

const SplitTextExample = () => {
  const { text } = useCasparData()

  return (
    <GsapTimeline
      hide={!text}
      onPlay={timeline => {
        timeline
          .from('.container', {
            opacity: 0,
            y: 70
          })
          .from('.char', {
            duration: 0.8,
            opacity: 0,
            scale: 0,
            y: 80,
            rotationX: 180,
            transformOrigin: '0% 50% -50',
            ease: 'back',
            stagger: 0.01
          })
      }}
      onStop={timeline => {
        timeline.reverse()
      }}
    >
      <div className="container">
        <SplitText key={text} value={text} />
      </div>
    </GsapTimeline>
  )
}

render(SplitTextExample)
