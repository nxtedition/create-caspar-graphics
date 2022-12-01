import React from 'react'
import { render, useCasparData } from '@nxtedition/graphics-kit'

function Example() {
  const { text } = useCasparData()

  return <div>Example: {text}</div>
}

render(Example)
