import React, { useEffect, useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { useCasparState, States, useAnimate } from 'caspar-graphics'

// TODO: Check if this can be added back. Currently it has problems with
// timeline.from() animations flickering before actually disappearing.
// gsap.ticker.fps(25)

export const useTimeline = (onLoad, onStop, options) => {
  const { isReady = true } = options || {}
  const state = useCasparState()
  const timelineRef = useRef()
  const timelineIdRef = useRef()
  const {
    addTimeline,
    removeTimeline,
    onTimelineReady,
    onTimelineEntered,
    onTimelineExited,
    animationsDidFinish
  } = useAnimate()

  useLayoutEffect(() => {
    timelineRef.current = gsap.timeline({ paused: true })
    let id = addTimeline()
    timelineIdRef.current = id

    return () => {
      removeTimeline(id)
    }
  }, [addTimeline, removeTimeline])

  useLayoutEffect(() => {
    if (!isReady) {
      return
    }

    if (onLoad) {
      onLoad(timelineRef.current)
      onTimelineReady(timelineIdRef.current)
    }
  }, [isReady, onTimelineReady])

  useEffect(() => {
    if (isReady === false) {
      return
    }

    const timeline = timelineRef.current

    if (state === States.playing) {
      timeline
        .eventCallback('onComplete', () => {
          onTimelineEntered(timelineIdRef.current)
        })
        .play()
    }

    if (state === States.paused) {
      timeline.pause()
    }

    if (state === States.stopped) {
      if (onStop) {
        onStop(timeline)

        const onComplete = () => {
          onTimelineExited(timelineIdRef.current)
        }

        timeline
          .eventCallback('onComplete', onComplete)
          .eventCallback('onReverseComplete', onComplete)
      } else {
        onTimelineExited(timelineIdRef.current)
      }
    }
  }, [state, isReady, animationsDidFinish, onTimelineExited])

  return timelineRef
}
