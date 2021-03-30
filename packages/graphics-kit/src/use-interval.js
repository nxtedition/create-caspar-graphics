import React from 'react '

export const useInterval = (callback, delay) => {
  const savedCallback = React.useRef()

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  React.useEffect(() => {
    const tick = () => {
      savedCallback.current()
    }

    if (delay !== null) {
      const id = window.setInterval(tick, delay)

      return () => {
        window.clearInterval(id)
      }
    }
  }, [delay])
}
