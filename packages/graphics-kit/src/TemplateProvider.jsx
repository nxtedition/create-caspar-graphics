import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  memo,
} from 'react'
import { parse } from './utils/parse'
import { States } from './constants'

export const TemplateContext = React.createContext()

export const TemplateProvider = ({
  children,
  name,
  windowSize: intitialWindowSize,
}) => {
  const [state, setState] = useState(States.loading)
  const [data, setData] = useState({})
  const [delays, setDelays] = useState([])
  const [resume, setResume] = useState()
  const [requestPlay, setRequestPlay] = useState(false)
  const [windowSize, setWindowSize] = useState(intitialWindowSize)

  const logger = (message) => {
    console.log(`${name || ''}${message}`)
  }

  const delayPlay = useCallback((key) => {
    setDelays((delays) => [...delays, key])

    return () => {
      setDelays((delays) => delays.filter((delay) => delay !== key))
    }
  }, [])

  useEffect(() => {
    window.onresize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
  }, [])

  // Handle state and data updates
  useLayoutEffect(() => {
    let didPlay = false

    window.load = () => {
      setState(States.loaded)
      logger('.load()')
    }

    window.play = () => {
      didPlay = true
      setRequestPlay(true)
      logger('.play()')
    }

    window.pause = () => {
      setState(States.paused)
      logger('.pause()')
    }

    window.stop = () => {
      if (didPlay) {
        setState(States.stopped)
        logger('.stop()')
      } else {
        setState(States.removed)
        logger('.stop() without play')
      }
    }

    window.update = (payload) => {
      const data = parse(payload)

      if (data) {
        logger(
          `.update(${data ? JSON.stringify(data || {}, null, 2) : 'null'})`,
        )

        setData(data)

        if (!didPlay) {
          const delay = delayPlay('__initialData')
          setResume(() => delay)
        }
      }
    }

    return () => {
      delete window.load
      delete window.play
      delete window.pause
      delete window.stop
      delete window.update
    }
  }, [])

  // If we received an update before the play command, we want to wait for its render cycle to
  // finish before we check if there are any registered delays.
  useEffect(() => {
    resume?.()
  }, [resume])

  // Wait for any delays to finish before playing.
  useEffect(() => {
    if (state < States.playing && requestPlay && !delays.length) {
      setState(States.playing)
    }
  }, [state, data, requestPlay, delays])

  // Remove template
  useEffect(() => {
    if (state === States.removed) {
      logger('.remove()')
      window.remove?.()
    }
  }, [state])

  const safeToRemove = useCallback(() => {
    setState(States.removed)
  }, [])

  return (
    <TemplateContext.Provider
      value={{
        data,
        state,
        name,
        safeToRemove,
        delayPlay,
        size: windowSize,
      }}
    >
      {state !== States.removed ? (
        <TemplateWrapper>{children}</TemplateWrapper>
      ) : null}
    </TemplateContext.Provider>
  )
}

const TemplateWrapper = memo(({ children }) => children)
