import React from 'react'
import { TemplateContext, States } from './template'

export { States }

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

export * from './template/animate'
