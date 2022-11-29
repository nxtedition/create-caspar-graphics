import React from 'react'

export const useClock = (...args) => {
  const [date, setDate] = React.useState(Date.now())
  const isDisabled = args.length === 0 || args[1] == null

  React.useEffect(() => {
    if (isDisabled) {
      return
    }

    const interval = window.setInterval(() => {
      setDate(Date.now())
    }, 500)

    return () => {
      window.clearInterval(interval)
    }
  }, [isDisabled])

  if (isDisabled) {
    return null
  }

  return Intl.DateTimeFormat(...args).format(date)
}
