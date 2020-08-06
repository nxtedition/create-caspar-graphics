import React, { useEffect, useRef, useLayoutEffect } from 'react'
import { TimelineMax } from 'gsap'
import { useCaspar, States } from 'caspar-graphics'

export const useTimeline = (onLoad, onStop, isReady = true) => {
  const { state, safeToRemove } = useCaspar()
  const timelineRef = useRef()

  useLayoutEffect(() => {
    timelineRef.current = new TimelineMax({ paused: true })

    if (onLoad) {
      onLoad(timelineRef.current)
    }
  }, [])

  useEffect(() => {
    if (isReady === false) {
      return
    }

    if (state === States.playing) {
      timelineRef.current.play()
    }

    if (state === States.paused) {
      timelineRef.current.pause()
    }

    if (state === States.stopped) {
      if (onStop) {
        onStop(timelineRef.current)
        timelineRef.current.eventCallback('onComplete', safeToRemove)
      } else {
        safeToRemove()
      }
    }
  }, [state, safeToRemove, isReady])

  return timelineRef
}
