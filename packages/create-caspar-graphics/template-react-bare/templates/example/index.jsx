import React from 'react'
import { render, useCaspar } from '@nxtedition/graphics-kit'

function Example() {
  const { data, isPlaying } = useCasparData()

  return (
    <div
      style={{
        opacity: isPlaying ? 1 : 0,
        position: 'absolute',
        bottom: 80,
        left: 266,
        width: 1388,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 6,
        fontSize: 70,
        fontFamily: 'Arial',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        transition: 'opacity 300ms ease-in-out'
      }}
    >
      {data.name}
    </div>
  )
}

render(Example)
