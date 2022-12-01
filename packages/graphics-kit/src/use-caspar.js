import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef
} from 'react'
import { TemplateContext, States } from './TemplateProvider'

export const useCaspar = () => {
  const { state, ...context } = React.useContext(TemplateContext)

  return {
    ...context,
    state,
    isLoading: state === States.loading,
    isLoaded: state === States.loaded,
    isPlaying: state === States.playing,
    isPaused: state === States.paused,
    isStopped: state === States.stopped
  }
}

export const useCasparState = () => {
  return React.useContext(TemplateContext).state
}

export const useCasparData = () => {
  return React.useContext(TemplateContext).data
}

export const useDelayPlay = ({ key }) => {
  const [delayedValue, setDelayedValue] = useState()
  const { delayPlay } = React.useContext(TemplateContext)
  const resumeRef = useRef()

  // Reset when key changes
  useEffect(() => {
    setDelayedValue(null)
  }, [key])

  useLayoutEffect(() => {
    if (!key) {
      return
    }

    const resume = delayPlay(key)
    resumeRef.current = resume

    return () => {
      resumeRef.current = null
      resume()
    }
  }, [delayPlay, key])

  const resume = useCallback(
    value => {
      setDelayedValue(value)
      resumeRef.current?.()
    },
    [key]
  )

  return [delayedValue, resume]
}
