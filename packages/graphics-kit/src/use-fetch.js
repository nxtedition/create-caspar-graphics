import { useState, useEffect } from 'react'
import { useInterval } from './use-interval'

export const useFetch = (url, { responseType = 'json', interval }) => {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  async function getData(url, { signal, responseType }) {
    setLoading(true)

    try {
      const data = await fetch(url, { signal }).then(res => res[responseType]())
      setData(data)
      setError(null)
    } catch (err) {
      console.log('Unable to get data:', err)
      setError(error)
    }

    setLoading(false)
  }

  // Fetch our initial data.
  useEffect(() => {
    if (!url) {
      return
    }

    const controller = new AbortController()
    getData(url, { signal: controller.signal, responseType })

    return () => {
      controller.abort()
    }
  }, [url, responseType])

  // Once we have our initial data, set up an interval (if enabled).
  useInterval(
    () => {
      getData(url, { responseType })
    },
    data != null && Number.isFinite(interval) ? interval * 1000 : null
  )

  return { data, isLoading, error }
}
