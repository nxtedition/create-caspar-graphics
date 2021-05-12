import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { parse } from './parse'
import { AnimateProvider } from './animate'

export const TemplateContext = React.createContext()

export const TemplateProvider = ({ children, name }) => {
  const [state, setState] = useState(States.loading)
  const [data, setData] = useState()

  const logger = (message, ...rest) => {
    console.log(`${name || 'caspar'}${message}`)
    rest && rest.length && console.log(rest)
  }

  // Handle state updates
  useEffect(() => {
    window.load = () => {
      setState(States.loaded)
      logger('.load()')
    }

    window.play = () => {
      setState(States.playing)
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

    return () => {
      delete window.load
      delete window.play
      delete window.pause
      delete window.stop
    }
  }, [])

  // Handle data updates
  useEffect(() => {
    window.update = data => {
      try {
        data = typeof data === 'string' ? parse(data) : data
      } catch (err) {
        console.error(err)
      }

      logger(`.update(${data ? JSON.stringify(data || {}, null, 2) : 'null'})`)

      if (data) {
        setData(data)
      }
    }

    return () => {
      delete window.update
    }
  }, [])

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

  // Make sure the data object doesn't change unless there's actually new data.
  const memoizedData = useMemo(() => data || {}, [JSON.stringify(data || {})])

  return (
    <TemplateContext.Provider
      value={{
        data: memoizedData,
        state,
        name,
        safeToRemove
      }}
    >
      <AnimateProvider>
        {state !== States.removed ? <Template>{children}</Template> : null}
      </AnimateProvider>
    </TemplateContext.Provider>
  )
}

const Template = React.memo(({ children }) => children)

export const States = {
  loading: 'LOADING',
  loaded: 'LOADED',
  playing: 'PLAYING',
  paused: 'PAUSED',
  stopped: 'STOPPED',
  removed: 'REMOVED'
}
