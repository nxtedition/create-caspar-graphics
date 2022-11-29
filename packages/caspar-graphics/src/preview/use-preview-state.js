import React, { useEffect } from 'react'
import { States } from '..'

export function usePreviewState({ templateWindow, autoPreview }) {
  const [state, setState] = React.useState(States.loading)

  // If auto preview is enabled, we play the template as soon
  // as it's ready.
  useEffect(() => {
    if (state === States.loaded && autoPreview) {
      setState(States.playing)
    }
  }, [state, autoPreview])

  // Update template with new state.
  useEffect(() => {
    if (!templateWindow?.play) {
      return
    }

    switch (state) {
      case States.playing: {
        templateWindow.play()
        break
      }
      case States.paused: {
        templateWindow.pause()
        break
      }
      case States.stopped: {
        templateWindow.stop()
        break
      }
    }
  }, [templateWindow, state])

  // Once the template has animated off, we want to reload it.
  // This is to imitate Caspar's remove method.
  useEffect(() => {
    if (state === States.loaded) {
      templateWindow.remove = () => {
        setState(States.loading)
        templateWindow.location.reload()
      }
    }
  }, [state, templateWindow])

  return [state, setState]
}
