import React, { useEffect, useLayoutEffect, useState } from 'react'
import { gsap } from 'gsap'
import { States } from './constants'
import { useCaspar } from './use-caspar'

export const GsapTimeline = ({ children, hide, wait = hide, onPlay, onStop }) => {
  const [timeline] = useState(gsap.timeline({ paused: true }))
  const { state, isStopped, safeToRemove } = useCaspar()
  const [didShow, setDidShow] = useState(false)
  const readyToShow = state >= States.playing && !wait

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

      timeline
        .eventCallback('onComplete', safeToRemove)
        .eventCallback('onReverseComplete', safeToRemove)
        .play()
    }
  }, [isStopped, safeToRemove])

  return readyToShow || didShow ? children : null
}
