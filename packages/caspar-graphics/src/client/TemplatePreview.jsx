import React, { useState, useEffect, useRef } from 'react'

const States = {
  load: 0,
  loaded: 1,
  play: 2,
  stop: 3,
}

export const ServerTemplate = ({ socket, name, layer, show, data }) => {
  const [state, setState] = useState(States.load)
  const [prevUpdate, setPrevUpdate] = useState()
  const source = `/templates/${name}/index.html`
  const nextUpdate = data && JSON.stringify(data) !== JSON.stringify(prevUpdate || {})
    ? data
    : null

  // Load
  useEffect(() => {
    if (socket && state === States.load) {
      socket.send(JSON.stringify({ type: 'load', source, layer }))
      setState(States.loaded)
    }
  }, [socket, source, state])

  // Data Updates
  useEffect(() => {
    if (socket && (state === States.loaded || state === States.play) && nextUpdate) {
      socket.send(JSON.stringify({ type: 'update', layer, data: nextUpdate }))
      setPrevUpdate(nextUpdate)
    }
  }, [socket, state, nextUpdate])

  // State Updates
  useEffect(() => {
    if (!socket) {
      return
    }

    if (show && state === States.loaded) {
      socket.send(JSON.stringify({ type: 'play', layer }))
      setState(States.play)
    } else if (!show && state === States.play) {
      socket.send(JSON.stringify({ type: 'stop', layer }))
      setState(States.stop)

      // TODO: wait for window.remove() to be called.
      const timeout = window.setTimeout(() => {
        setState(States.load)
        setPrevUpdate(null)
      }, 2000)

      return () => {
        window.clearTimeout(timeout)
      }
    }
  }, [socket, show, state])

  return null
}

export const TemplatePreview = ({
  name,
  src = `/templates/${name}/index.html`,
  show,
  dispatch,
  data,
}) => {
  const [templateWindow, setTemplateWindow] = useState()
  const [didShow, setDidShow] = useState(false)
  const ref = useRef()

  // Data Updates
  useEffect(() => {
    if (templateWindow?.update) {
      templateWindow.update(data || {})
    }
  }, [templateWindow, data])


  // State Updates
  useEffect(() => {
    if (!templateWindow) {
      return
    }

    if (show && !didShow) {
      templateWindow.play()
      setDidShow(true)
    } else if (!show && didShow) {
      if (templateWindow.stop) {
        templateWindow.stop()
      } else {
        console.warn('No window.stop() found')
      }
    }
  }, [templateWindow, show, didShow])
 
  return (
    <iframe
      style={{ pointerEvents: show ? 'auto' : 'none' }}
      ref={ref}
      src={src}
      onLoad={evt => {
        const { contentWindow } = evt.target

        // Once the template has animated off, we want to reload it.
        // This is to imitate Caspar's remove method.
        contentWindow.remove = () => {
          contentWindow.location.reload()
          setTemplateWindow(null)
          dispatch({ type: 'removed', template: name })
        }

        // The play command might not be ready on load, so here we basically poll the template
        // to see if it has exposed a play command.
        let retries = 0

        function checkIfReady() {
          if (contentWindow.play) {
            setTemplateWindow(contentWindow)
          } else if (retries < 20) {
            setTimeout(checkIfReady, (++retries) ** 2 * 10)
          } else {
            console.error('No window.play found')
          }
        }

        checkIfReady()
      }}
    />
  )
}
