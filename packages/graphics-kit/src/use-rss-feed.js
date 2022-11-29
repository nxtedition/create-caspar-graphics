import React from 'react'
import { parseFeed } from 'htmlparser2'

export const useRssFeed = (url, transformFn) => {
  const [data, setData] = React.useState(null)

  React.useEffect(() => {
    if (!url) {
      setData(null)
      return
    }

    let isDisposed = false

    async function fetchData() {
      try {
        const data = await fetch(url)
          .then(res => res.text())
          .then(text => parseFeed(text))

        if (!isDisposed) {
          setData(data)
        }
      } catch (err) {
        console.error(`Unable to get data from ${url}`, err)
      }
    }

    fetchData()

    return () => {
      isDisposed = true
    }
  }, [url])

  return transformFn ? transformFn(data) : data
}
