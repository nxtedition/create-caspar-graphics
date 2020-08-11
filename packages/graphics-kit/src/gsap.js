import React, { useEffect, useRef, useLayoutEffect } from 'react'
import { TimelineMax } from 'gsap'
import { useCaspar, States, useAnimate } from 'caspar-graphics'

export const useTimeline = (onLoad, onStop, isReady = true) => {
  const { state, safeToRemove } = useCaspar()
  const timelineRef = useRef()
  const animate = useAnimate()
  const { animationsDidFinish } = animate

  useLayoutEffect(() => {
    animate.addTemplate()
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
      timelineRef.current.eventCallback('onComplete', animate.onEntered).play()
    }

    if (state === States.paused) {
      timelineRef.current.pause()
    }

    if (state === States.stopped && animationsDidFinish) {
      if (onStop) {
        onStop(timelineRef.current, pause)
        timelineRef.current.eventCallback('onComplete', safeToRemove)
      } else {
        safeToRemove()
      }
    }
  }, [state, safeToRemove, isReady, animationsDidFinish])

  return timelineRef
}
