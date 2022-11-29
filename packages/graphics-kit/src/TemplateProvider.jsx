import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from 'react'
import * as ReactDOM from 'react-dom/client'
import { parse } from './utils/parse'

export const TemplateContext = React.createContext()

let root = null

export const render = (Template, options) => {
  let {
    container = document.getElementById('root'),
    cssReset = true,
    name = Template.name
  } = options || {}

  if (!container) {
    container = document.createElement('div')
    container.id = 'root'
    document.body.appendChild(container)
  }

  if (cssReset) {
    const reset = ` 
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      margin: 0;
    `
    document.body.style.cssText = reset
    container.style.cssText = reset
  }

  if (!root) {
    root = ReactDOM.createRoot(container)
  }

  root.render(
    React.createElement(
      TemplateProvider,
      { name },
      React.createElement(Template)
    )
  )
}

const TemplateProvider = ({ children, name }) => {
  const [state, setState] = useState(States.loading)
  const [data, setData] = useState({})
  const [delays, setDelays] = useState([])
  const [resume, setResume] = useState()
  const [requestPlay, setRequestPlay] = useState(false)

  const logger = message => {
    console.log(`${name || ''}${message}`)
  }

  const delayPlay = useCallback(key => {
    setDelays(delays => [...delays, key])

    return () => {
      setDelays(delays => delays.filter(delay => delay !== key))
    }
  }, [])

  // Handle state and data updates
  useEffect(() => {
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
      setState(States.stopped)
      logger('.stop()')
    }

    window.update = payload => {
      const data = typeof payload === 'string' ? parse(payload) : payload

      if (data) {
        logger(
          `.update(${data ? JSON.stringify(data || {}, null, 2) : 'null'})`
        )

        setData(data)

        if (!didPlay) {
          const delay = delayPlay('__initialData')
          setResume(() => delay)
        }
      }
    }

    // Let the preview app know that we're all set up.
    window.onReady?.(window)

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
  React.useEffect(() => {
    resume?.()
  }, [resume])

  // Wait for any delays to finish before playing.
  React.useEffect(() => {
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
        delayPlay
      }}
    >
      {state !== States.removed ? (
        <TemplateWrapper>{children}</TemplateWrapper>
      ) : null}
    </TemplateContext.Provider>
  )
}

const TemplateWrapper = React.memo(({ children }) => children)

export const States = {
  loading: 0,
  loaded: 1,
  playing: 2,
  paused: 3,
  stopped: 4,
  removed: 5
}

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
