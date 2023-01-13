import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
  useMemo
} from 'react'
import { TemplateContext } from './TemplateProvider'
import { States } from './constants'

export const useCaspar = opts => {
  const { state, ...context } = React.useContext(TemplateContext)
  const data = useCasparData(opts)

  return {
    ...context,
    data,
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

export const useCasparData = opts => {
  const { data } = React.useContext(TemplateContext)
  const { trim = true } = opts || {}

  return useMemo(() => {
    if (!trim) {
      return data
    }

    const trimmed = {}

    for (const [key, value] of Object.entries(data)) {
      trimmed[key] = typeof value === 'string' ? value.trim() : value
    }

    return trimmed
  }, [data, trim])
}

export const useMergedData = opts => {
  const data = useCasparData(opts)
  const ref = useRef({})

  React.useEffect(() => {
    ref.current = { ...ref.current, ...data }
  }, [data])

  return { ...ref.current, ...data }
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
