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
    case 'ADD_REF': {
      const refs = { ...state.refs }
      refs[event.id] = true
      return { ...state, refs }
    }
    case 'REMOVE_REF': {
      if (!state.refs) {
        return state
      }

      const refs = { ...state.refs }
      delete refs[event.id]
      return { ...state, refs }
    }
    case 'CHILD_ENTERED': {
      const refs = { ...state.refs }
      refs[event.id] = AnimationStates.entered
      return { ...state, refs }
    }
    case 'CHILD_EXITED': {
      const refs = { ...state.refs }
      refs[event.id] = AnimationStates.exited
      return { ...state, refs }
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

  const addChild = useCallback(() => {
    const id = idRef.current++
    dispatch({ type: 'ADD_REF', id })
    return id
  }, [])

  const removeChild = useCallback(id => {
    dispatch({ type: 'REMOVE_REF', id })
  }, [])

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

  const onEntered = useCallback(() => {
    dispatch({ type: 'ENTERED' })
  }, [])

  const onChildEntered = useCallback(id => {
    dispatch({ type: 'CHILD_ENTERED', id })
  }, [])

  const onChildExited = useCallback(id => {
    dispatch({ type: 'CHILD_EXITED', id })
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
        onEntered,
        addChild,
        removeChild,
        onChildEntered,
        onChildExited,
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

export const useAnimation = () => {
  const animate = useContext(AnimateContext)
  const animateRef = useRef()
  const casparState = useCasparState()

  console.log({ animate })

  let animationState = AnimationStates.hidden

  if (casparState === States.stopped) {
    animationState = AnimationStates.exit
  } else if (animate.timelinesDidEnter) {
    animationState = AnimationStates.enter
  } else if (animate.state == null && casparState === States.playing) {
    animationState = AnimationStates.enter
  }

  React.useEffect(() => {
    animateRef.current = animate.addChild()

    return () => {
      animate.removeChild(animateRef.current)
    }
  }, [])

  const onAnimationComplete = () => {
    if (animationState === AnimationStates.enter) {
      animate.onChildEntered(animateRef.current)
    } else if (animationState === AnimationStates.exit) {
      animate.onChildExited(animateRef.current)
    }
  }

  return [animationState, onAnimationComplete]
}
