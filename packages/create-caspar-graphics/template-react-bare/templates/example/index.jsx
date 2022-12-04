import React, { useRef } from 'react'
import { render, useCaspar, States } from '@nxtedition/graphics-kit'

function Example() {
  const { data, state, safeToRemove } = useCaspar()

  React.useEffect(() => {
    if (state === States.stopped) {
      setTimeout(safeToRemove, 300)
    }
  }, [state, safeToRemove])

  return (
    <div
      style={{
        opacity: state === States.playing ? 1 : 0,
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
