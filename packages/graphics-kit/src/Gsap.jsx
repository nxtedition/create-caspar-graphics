import React, { useEffect, useLayoutEffect, useState } from 'react'
import { gsap } from 'gsap'
import { useCaspar, States } from './TemplateProvider'

export const GsapTimeline = ({ children, hide, onPlay, onStop }) => {
  const [timeline] = useState(gsap.timeline({ paused: true }))
  const { state, isPlaying, isStopped, safeToRemove } = useCaspar()

  useLayoutEffect(() => {
    if (isPlaying && onPlay) {
      onPlay(timeline)
      timeline.play()
    }
  }, [isPlaying])

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
    }
  }, [isStopped, safeToRemove])

  return !hide && state >= States.playing ? children : null
}
