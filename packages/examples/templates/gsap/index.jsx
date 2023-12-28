import React from 'react'
import { render, GsapTimeline, useCasparData } from '@nxtedition/graphics-kit'
import './style.css'

const GsapExample = () => {
  const { name } = useCasparData()

  return (
    <GsapTimeline
      hide={!name}
      onPlay={timeline => {
        timeline.from('#name', { y: 50, opacity: 0 })
      }}
      onStop={timeline => {
        timeline.to('#name', { y: 50, opacity: 0 })
      }}
    >
      <div id="name">
        {name}
      </div>
    </GsapTimeline>
  )
}

render(GsapExample)
