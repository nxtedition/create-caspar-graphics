import React, { useRef, useReducer, useCallback, useContext } from 'react'
import { useCasparState, useCaspar, States } from '../'

// NOTE: All this is considered WIP.

export const AnimationStates = {
  hidden: 'HIDDEN',
  ready: 'READY',
  enter: 'ENTER',
  entered: 'ENTERED',
  exit: 'EXIT',
  exited: 'EXITED'
}

const reducer = (state, event) => {
  switch (event.type) {
    case 'ADD_TIMELINE': {
      const timelines = { ...state.timelines }
      timelines[event.id] = AnimationStates.hidden
      return { ...state, timelines, state: 'did-init' }
    }
    case 'REMOVE_TIMELINE': {
      const timelines = { ...state.timelines }
      delete timelines[event.id]
      return { ...state, timelines }
    }
    case 'TIMELINE_READY': {
      const timelines = { ...state.timelines }
      timelines[event.id] = AnimationStates.ready
      return { ...state, timelines }
    }
    case 'TIMELINE_ENTERED': {
      const timelines = { ...state.timelines }
      timelines[event.id] = AnimationStates.entered
      return { ...state, timelines }
    }
    case 'TIMELINE_EXITED': {
      const timelines = { ...state.timelines }
      timelines[event.id] = AnimationStates.exited
      return { ...state, timelines }
    }
    case 'ENTERED': {
      return { ...state, state: 'did-enter' }
    }
    default: {
      console.warn(`Unknown type: ${event.type}`)
      return state
    }
  }
}

const AnimateContext = React.createContext()

export const AnimateProvider = ({ children }) => {
  const idRef = useRef(0)
  const [state, dispatch] = useReducer(reducer, {
    didInit: false,
    timelineRefs: React.useRef({})
  })

  const addTimeline = useCallback(() => {
    const id = idRef.current++
    dispatch({ type: 'ADD_TIMELINE', id })
    return id
  }, [])

  const removeTimeline = useCallback(id => {
    dispatch({ type: 'REMOVE_TIMELINE', id })
  }, [])

  const onTimelineReady = useCallback(id => {
    dispatch({ type: 'TIMELINE_READY', id })
  }, [])

  const onTimelineEntered = useCallback(id => {
    dispatch({ type: 'TIMELINE_ENTERED', id })
  }, [])

  const onTimelineExited = useCallback(id => {
    dispatch({ type: 'TIMELINE_EXITED', id })
  }, [])

  const { safeToRemove } = useCaspar()

  React.useEffect(() => {
    const timelines = Object.values(state.timelines || {})

    if (timelines.length === 0) {
      return
    }

    if (timelines.every(state => state === AnimationStates.exited)) {
      safeToRemove()
    }
  }, [safeToRemove, state.timelines])

  const animationsDidFinish =
    state.refs == null ||
    Object.values(state.refs).every(state => state === AnimationStates.exited)

  const timelinesDidEnter =
    state.timelines != null &&
    Object.values(state.timelines).every(
      state => state === AnimationStates.entered
    )

  return (
    <AnimateContext.Provider
      value={{
        state: state.state,
        addTimeline,
        removeTimeline,
        onTimelineReady,
        onTimelineEntered,
        onTimelineExited,
        animationsDidFinish,
        timelinesDidEnter
      }}
    >
      {children}
    </AnimateContext.Provider>
  )
}

export const useAnimate = () => {
  return useContext(AnimateContext)
}
