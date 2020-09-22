import React from 'react'
import { gsap } from 'gsap'

export const useAnimatedChange = (nextValue, outTween, inTween) => {
  const nextRef = React.useRef()
  const currRef = React.useRef()
  const [currValue, setCurrValue] = React.useState()

  React.useEffect(() => {
    if (currValue === nextValue) {
      return
    }

    if (!currValue) {
      setCurrValue(nextValue)
      return
    }

    const timeline = gsap
      .timeline({
        onComplete: () => {
          setCurrValue(nextValue)
        }
      })
      .to(currRef.current, outTween)
      .to(nextRef.current, inTween, 0)

    return () => {
      if (timeline) {
        timeline.kill()
        // Reset to start position
        gsap.set([currRef.current, nextRef.current], { clearProps: 'all' })
      }
    }
  }, [currValue, nextValue])

  return [
    { value: currValue || nextValue, ref: currRef },
    { value: nextValue, ref: nextRef }
  ]
}
