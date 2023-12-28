import React, { useEffect, useLayoutEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { gsap } from 'gsap'
import { States } from './constants'
import { useCaspar } from './use-caspar'

export const GsapTimeline = forwardRef(function GsapTimeline({ children, hide, wait = hide, onPlay, onStop }, forwardedRef) {
  const [timeline] = useState(gsap.timeline({ paused: true }))
  const { state, isStopped, safeToRemove } = useCaspar()
  const [didShow, setDidShow] = useState(false)
  const readyToShow = state >= States.playing && !wait

  useImperativeHandle(forwardedRef, () => timeline)

  useLayoutEffect(() => {
    if (!readyToShow) {
      return
    }

    if (onPlay) {
      onPlay(timeline)
      timeline.play()
    }

    setDidShow(true)
  }, [readyToShow])

  useEffect(() => {
    if (!isStopped) {
      return
    }

    if (!onStop) {
      safeToRemove()
    } else {
      onStop(timeline)

      const callbackType = timeline.reversed()
        ? 'onReverseComplete'
        : 'onComplete'

      timeline.eventCallback(callbackType, safeToRemove)
    }
  }, [isStopped, safeToRemove])

  return readyToShow || didShow ? children : null
})
