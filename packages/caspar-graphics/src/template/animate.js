import React, { useRef, useReducer, useCallback, useContext } from 'react'
import { useCasparState, States } from '../'

export const AnimationStates = {
  hidden: 'HIDDEN',
  enter: 'ENTER',
  entered: 'ENTERED',
  exit: 'EXIT',
  exited: 'EXITED'
}

const reducer = (state, event) => {
  switch (event.type) {
    case 'ADD_TEMPLATE': {
      return { ...state, template: true, state: 'did-init' }
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
      console.log(`Unknown type: ${event.type}`)
      return state
    }
  }
}

const AnimateContext = React.createContext()

export const AnimateProvider = ({ children }) => {
  const idRef = useRef(0)
  const [state, dispatch] = useReducer(reducer, { didInit: false })

  const addChild = useCallback(() => {
    const id = idRef.current++
    dispatch({ type: 'ADD_REF', id })
    return id
  }, [idRef])

  const removeChild = useCallback(id => {
    dispatch({ type: 'REMOVE_REF', id })
  }, [])

  const addTemplate = useCallback(() => {
    dispatch({ type: 'ADD_TEMPLATE' })
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

  const animationsDidFinish =
    state.refs == null ||
    Object.values(state.refs).every(state => state === AnimationStates.exited)

  return (
    <AnimateContext.Provider
      value={{
        state: state.state,
        addTemplate,
        onEntered,
        addChild,
        removeChild,
        onChildEntered,
        onChildExited,
        animationsDidFinish
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
  console.log(animate.state, casparState)

  let animationState = AnimationStates.hidden

  if (casparState === States.stopped) {
    animationState = AnimationStates.exit
  } else if (animate.state === 'did-enter') {
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
