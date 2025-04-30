import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  useContext,
} from 'react'
import { TemplateContext } from './TemplateProvider'
import { States } from './constants'
import { useTimeout } from './use-timeout'

export const useCaspar = (opts) => {
  const { state, safeToRemove, size, ...context } = useContext(TemplateContext)
  const data = useCasparData(opts)

  useTimeout(
    safeToRemove,
    state === States.stopped && Number.isFinite(opts?.removeDelay)
      ? opts.removeDelay * 1000
      : null,
  )

  return {
    ...context,
    size,
    aspectRatio: size.width / size.height,
    data,
    state,
    safeToRemove,
    isPlaying: state === States.playing,
    isStopped: state === States.stopped,
  }
}

export const useCasparState = () => {
  return useContext(TemplateContext).state
}

export const useCasparData = (opts) => {
  const { data } = useContext(TemplateContext)
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

export const useMergedData = (opts) => {
  const data = useCasparData(opts)
  const ref = useRef({})

  useEffect(() => {
    ref.current = { ...ref.current, ...data }
  }, [data])

  return { ...ref.current, ...data }
}

export const useDelayPlay = ({ key }) => {
  const [delayedValue, setDelayedValue] = useState()
  const { delayPlay } = useContext(TemplateContext)
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
    (value) => {
      setDelayedValue(value)
      resumeRef.current?.()
    },
    [key],
  )

  return [delayedValue, resume]
}
